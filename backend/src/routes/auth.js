import express from 'express';
import { db } from '../../database/db.js';

const router = express.Router();

export const BRANCH_CODES = {
  '01': 'CIVIL ENGINEERING (CIVIL)',
  '02': 'ELECTRICAL AND ELECTRONICS ENGINEERING (EEE)',
  '03': 'MECHANICAL ENGINEERING (MECH)',
  '04': 'ELECTRONICS AND COMMUNICATION ENGINEERING (ECE)',
  '05': 'COMPUTER SCIENCE AND ENGINEERING (CSE)',
  '30': 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE (AIDS)',
  '33': 'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING (AIML)'
};

// Helper: Extract roll no and decode branch from email
export function decodeStudentEmail(email) {
  if (!email || !email.includes('@')) {
    return { valid: false, error: 'Invalid email address.' };
  }

  const [prefix, domain] = email.toLowerCase().trim().split('@');
  if (domain !== 'nbkrist.org') {
    return { valid: false, error: 'Student registration is strictly for @nbkrist.org domain only.' };
  }

  const rollNo = prefix.toUpperCase();

  // Branch code is the 3rd and 4th digits from right in the roll number
  // e.g. '24KB1A05TY' -> length 10 -> characters at -4 and -3: '0' and '5' => '05'
  let branchCode = null;
  let branchName = 'General Engineering';

  if (rollNo.length >= 4) {
    branchCode = rollNo.slice(-4, -2);
    if (BRANCH_CODES[branchCode]) {
      branchName = BRANCH_CODES[branchCode];
    }
  }

  return {
    valid: true,
    email: email.toLowerCase().trim(),
    rollNo,
    branchCode: branchCode || '05',
    branchName
  };
}

// 1. Roll No & Branch Decoder endpoint (Live preview during typing/Google login)
router.post('/decode-roll', (req, res) => {
  const { email } = req.body;
  const decoded = decodeStudentEmail(email);
  if (!decoded.valid) {
    return res.status(400).json({ success: false, message: decoded.error });
  }
  return res.json({ success: true, ...decoded });
});

// 2. Student Registration (Google Sign-In or Direct Registration strictly for @nbkrist.org)
router.post('/student-register', async (req, res) => {
  try {
    const { email, name, year, bio, avatar_url } = req.body;

    const decoded = decodeStudentEmail(email);
    if (!decoded.valid) {
      return res.status(400).json({ success: false, message: decoded.error });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Student name is required.' });
    }

    const parsedYear = Number(year);
    if (!parsedYear || parsedYear < 1 || parsedYear > 4) {
      return res.status(400).json({ success: false, message: 'Please select a valid year between 1 and 4.' });
    }

    // Check if user already exists
    const existing = await db.getUserByEmail(decoded.email);
    if (existing) {
      return res.json({ success: true, message: 'Welcome back!', user: existing });
    }

    const newUser = await db.createUser({
      role: 'student',
      email: decoded.email,
      name: name.trim(),
      roll_no: decoded.rollNo,
      branch_code: decoded.branchCode,
      branch_name: decoded.branchName,
      year: parsedYear,
      bio: bio || `${parsedYear}st/nd/rd/th Year ${decoded.branchName} Student at NBKRIST`,
      avatar_url: avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${decoded.rollNo}`
    });

    res.status(201).json({
      success: true,
      message: 'Student profile registered successfully with NBKRIST credentials!',
      user: newUser
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Faculty Registration (Any email allowed)
router.post('/faculty-register', async (req, res) => {
  try {
    const { email, name, dealing_branch, dealing_year, sections, bio, avatar_url } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Faculty name is required.' });
    }

    if (!dealing_branch) {
      return res.status(400).json({ success: false, message: 'Dealing branch is required.' });
    }

    const existing = await db.getUserByEmail(email.toLowerCase().trim());
    if (existing) {
      return res.json({ success: true, message: 'Welcome back!', user: existing });
    }

    const newUser = await db.createUser({
      role: 'faculty',
      email: email.toLowerCase().trim(),
      name: name.trim(),
      dealing_branch,
      dealing_year: dealing_year || '1, 2, 3, 4',
      sections: sections || 'A, B',
      bio: bio || `Faculty member in ${dealing_branch} at NBKRIST`,
      avatar_url: avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(name)}`
    });

    res.status(201).json({
      success: true,
      message: 'Faculty profile registered successfully!',
      user: newUser
    });
  } catch (error) {
    console.error('Faculty registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Quick Login / Mock Switcher (for seamless testing of Student vs Faculty roles)
router.post('/login', async (req, res) => {
  try {
    const { email, role } = req.body;
    let user = null;

    if (email) {
      user = await db.getUserByEmail(email.toLowerCase().trim());
    }

    if (!user && role) {
      const users = await db.getUsers(role);
      user = users[0] || null;
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
