import express from 'express';
import { db } from '../../database/db.js';

const router = express.Router();

// 1. GET all faculty members
router.get('/', async (req, res) => {
  try {
    const { branch, search } = req.query;
    let facultyList = await db.getUsers('faculty', branch);

    if (search) {
      const q = search.toLowerCase();
      facultyList = facultyList.filter(f =>
        f.name.toLowerCase().includes(q) ||
        (f.dealing_branch && f.dealing_branch.toLowerCase().includes(q)) ||
        (f.sections && f.sections.toLowerCase().includes(q))
      );
    }

    const allUploads = await db.getUploads({});
    const enriched = facultyList.map(faculty => {
      const facultyUploads = allUploads.filter(u => u.user_id === faculty.id && !u.is_deleted);
      const recommendedByThisFaculty = allUploads.filter(u => u.recommended_by_faculty_id === faculty.id);

      return {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        dealing_branch: faculty.dealing_branch,
        dealing_year: faculty.dealing_year,
        sections: faculty.sections,
        avatar_url: faculty.avatar_url,
        bio: faculty.bio,
        uploads_count: facultyUploads.length,
        recommendations_count: recommendedByThisFaculty.length
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET single faculty profile with their uploads & recommendations
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const faculty = await db.getUserById(id);

    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({ success: false, message: 'Faculty profile not found.' });
    }

    const uploads = await db.getUploads({ user_id: faculty.id });
    const allUploads = await db.getUploads({});
    const verifiedUploads = allUploads.filter(u => u.recommended_by_faculty_id === faculty.id);

    res.json({
      success: true,
      data: {
        ...faculty,
        uploads,
        verified_uploads: verifiedUploads
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
