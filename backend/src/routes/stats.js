import express from 'express';
import { db } from '../../database/db.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const trending = await db.getTrendingUploads(6);
    const bestProfile = await db.getBestProfileOfTheWeek();
    const students = await db.getUsers('student');
    const faculty = await db.getUsers('faculty');
    const allUploads = await db.getUploads({});

    const totalMaterials = allUploads.filter(u => !u.is_deleted).length;
    const recommendedCount = allUploads.filter(u => u.is_faculty_recommended).length;

    res.json({
      success: true,
      data: {
        trending,
        best_profile: bestProfile,
        stats: {
          total_students: students.length,
          total_faculty: faculty.length,
          total_materials: totalMaterials,
          faculty_recommended_materials: recommendedCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
