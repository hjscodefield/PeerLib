import express from 'express';
import { db } from '../../database/db.js';

const router = express.Router();

// 1. GET all students with filters
router.get('/', async (req, res) => {
  try {
    const { branch, year, search, viewer_id } = req.query;
    let students = await db.getUsers('student', branch, year);

    if (search) {
      const q = search.toLowerCase();
      students = students.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.roll_no && s.roll_no.toLowerCase().includes(q)) ||
        (s.branch_name && s.branch_name.toLowerCase().includes(q))
      );
    }

    let userStarredList = [];
    if (viewer_id) {
      userStarredList = await db.getUserGivenStars(viewer_id);
    }

    // Attach uploads count and starred status
    const allUploads = await db.getUploads({});
    const enriched = students.map(student => {
      const studentUploads = allUploads.filter(u => u.user_id === student.id && !u.is_deleted);
      const isStarred = userStarredList.includes(student.id);
      const facultyRecommendedCount = studentUploads.filter(u => u.is_faculty_recommended).length;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        roll_no: student.roll_no,
        branch_code: student.branch_code,
        branch_name: student.branch_name,
        year: student.year,
        stars_count: student.stars_count || 0,
        points: student.points || 0,
        avatar_url: student.avatar_url,
        bio: student.bio,
        uploads_count: studentUploads.length,
        faculty_recommended_count: facultyRecommendedCount,
        is_starred: isStarred
      };
    });

    // Sort by points and stars descending
    enriched.sort((a, b) => b.points - a.points || b.stars_count - a.stars_count);

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET single student profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { viewer_id } = req.query;

    const student = await db.getUserById(id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const uploads = await db.getUploads({ user_id: student.id });
    
    let isStarred = false;
    if (viewer_id) {
      const stars = await db.getUserGivenStars(viewer_id);
      isStarred = stars.includes(student.id);
    }

    res.json({
      success: true,
      data: {
        ...student,
        is_starred: isStarred,
        uploads
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. POST toggle star on student profile
router.post('/:id/star', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'User ID is required to star a profile.' });
    }

    if (Number(id) === Number(user_id)) {
      return res.status(400).json({ success: false, message: 'You cannot star your own profile.' });
    }

    const result = await db.toggleStar(id, user_id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
