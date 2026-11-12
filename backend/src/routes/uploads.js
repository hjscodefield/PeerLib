import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../../database/db.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}_${safeName}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB
});

export const VALID_CATEGORIES = [
  'Lecture Notes',
  'Assignment',
  'Own Notes',
  'Study Material',
  'Record'
];

// 1. GET all uploads with filters
router.get('/', async (req, res) => {
  try {
    const { category, branch, year, search, user_id, viewer_role = 'student', viewer_id } = req.query;

    let items = await db.getUploads({
      category,
      branch,
      year,
      search,
      user_id,
      viewer_role
    });

    // Check user's liked status if viewer_id is passed
    let userLikes = [];
    if (viewer_id) {
      userLikes = await db.getUserLikes(viewer_id);
    }

    // Process viewing restrictions for flagged posts
    const sanitizedItems = items.map(item => {
      const isLiked = userLikes.includes(item.id);
      
      if (item.is_flagged) {
        if (viewer_role === 'student') {
          // Students cannot view content nor download flagged posts
          return {
            id: item.id,
            user_id: item.user_id,
            user_name: item.user_name,
            user_role: item.user_role,
            title: item.title,
            category: item.category,
            subject: item.subject,
            year: item.year,
            branch_code: item.branch_code,
            branch_name: item.branch_name,
            is_flagged: true,
            flagged_by_faculty_name: item.flagged_by_faculty_name,
            flagged_reason: item.flagged_reason,
            flagged_at: item.flagged_at,
            auto_delete_at: item.auto_delete_at,
            access_blocked: true,
            block_message: `🚫 Material access restricted. Flagged by ${item.flagged_by_faculty_name || 'Faculty'}. Under review and scheduled for deletion in 2 days.`,
            can_download: false,
            can_view: false,
            likes_count: item.likes_count,
            is_liked: isLiked,
            created_at: item.created_at
          };
        } else {
          // Faculty can view to inspect, but CANNOT download
          return {
            ...item,
            is_liked: isLiked,
            can_download: false,
            can_view: true,
            faculty_notice: `⚠️ Flagged by ${item.flagged_by_faculty_name}. Download is disabled for all users.`
          };
        }
      }

      return {
        ...item,
        is_liked: isLiked,
        can_download: true,
        can_view: true
      };
    });

    res.json({ success: true, count: sanitizedItems.length, data: sanitizedItems });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET single upload with comments
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { viewer_role = 'student', viewer_id } = req.query;

    const uploadItem = await db.getUploadById(id);
    if (!uploadItem) {
      return res.status(404).json({ success: false, message: 'Material not found or has been deleted.' });
    }

    if (uploadItem.is_flagged && viewer_role === 'student') {
      return res.status(403).json({
        success: false,
        is_flagged: true,
        message: `This upload has been flagged by ${uploadItem.flagged_by_faculty_name || 'faculty'} and cannot be viewed or downloaded by students.`
      });
    }

    const comments = await db.getComments(id);
    let isLiked = false;
    if (viewer_id) {
      const likes = await db.getUserLikes(viewer_id);
      isLiked = likes.includes(uploadItem.id);
    }

    res.json({
      success: true,
      data: {
        ...uploadItem,
        is_liked: isLiked,
        can_download: !uploadItem.is_flagged,
        comments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. POST new upload
router.post('/', upload.single('document'), async (req, res) => {
  try {
    const {
      user_id,
      title,
      category,
      subject,
      year,
      branch_code,
      branch_name,
      description,
      assignment_questions_confirmed
    } = req.body;

    if (!user_id || !title || !category || !subject || !year || !branch_code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Title, Category, Subject, Year, Branch.'
      });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
      });
    }

    const user = await db.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // STRICT ACADEMIC INTEGRITY RULE FOR ASSIGNMENTS:
    // If student uploads an assignment, they must confirm questions only.
    if (user.role === 'student' && category === 'Assignment') {
      if (assignment_questions_confirmed !== 'true' && assignment_questions_confirmed !== true) {
        return res.status(400).json({
          success: false,
          warning: 'ASSIGNMENT_POLICY_VIOLATION',
          message: 'Students may upload Assignment Questions ONLY! Posting assignment solutions/answers is strictly prohibited.'
        });
      }
    }

    let fileName = 'Study_Material.pdf';
    let fileUrl = '/sample_docs/c_assignment_q.pdf';
    let fileSize = '1.5 MB';
    let fileType = 'application/pdf';

    if (req.file) {
      fileName = req.file.originalname;
      fileUrl = `/uploads/${req.file.filename}`;
      fileSize = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;
      fileType = req.file.mimetype;
    }

    const newUpload = await db.createUpload({
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      title: title.trim(),
      category,
      subject: subject.trim(),
      year: Number(year),
      branch_code,
      branch_name: branch_name || user.branch_name || 'Engineering',
      file_name: fileName,
      file_url: fileUrl,
      file_size: fileSize,
      file_type: fileType,
      description: description || ''
    });

    res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully! (+10 reputation points)',
      data: newUpload
    });
  } catch (error) {
    console.error('Upload creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. DOWNLOAD upload
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const uploadItem = await db.getUploadById(id);

    if (!uploadItem) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    // RULE: "When flagged the upload can no longer be downloaded by anyone"
    if (uploadItem.is_flagged) {
      return res.status(403).json({
        success: false,
        message: `🚫 Download disabled! This upload has been flagged by ${uploadItem.flagged_by_faculty_name || 'faculty'} and cannot be downloaded by anyone.`
      });
    }

    // Check if physical file exists in uploads dir
    if (uploadItem.file_url.startsWith('/uploads/')) {
      const filename = path.basename(uploadItem.file_url);
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        return res.download(filePath, uploadItem.file_name);
      }
    }

    // Fallback: send text representation or sample content
    res.setHeader('Content-disposition', `attachment; filename="${uploadItem.file_name}"`);
    res.setHeader('Content-type', 'application/pdf');
    res.send(`%PDF-1.4\n% NBKRIST PeerLib Sample Material: ${uploadItem.title}\nAuthor: ${uploadItem.user_name}\nSubject: ${uploadItem.subject}\n%%EOF`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. TOGGLE LIKE
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ success: false, message: 'User ID is required to like a post.' });
    }

    const result = await db.toggleLike(id, user_id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. ADD COMMENT
router.post('/:id/comment', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, comment_text } = req.body;

    if (!user_id || !comment_text || !comment_text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text and user ID are required.' });
    }

    const user = await db.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const comment = await db.addComment({
      upload_id: id,
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      comment_text: comment_text.trim()
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. FACULTY RECOMMENDATION
router.post('/:id/recommend', async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty_id } = req.body;

    const faculty = await db.getUserById(faculty_id);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Only faculty members can recommend study materials.' });
    }

    const updated = await db.recommendUpload(id, faculty.id, faculty.name);
    res.json({
      success: true,
      message: `Marked as Faculty Recommended by ${faculty.name}! (+25 bonus points to student)`,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. FACULTY FLAGGING & IMMEDIATE FLAG & DELETE
router.post('/:id/flag', async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty_id, reason, action } = req.body; // action: 'flag' or 'flag_delete'

    const faculty = await db.getUserById(faculty_id);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Only faculty members can moderate study materials.' });
    }

    const shouldDelete = action === 'flag_delete';
    const result = await db.flagUpload(id, faculty.id, faculty.name, reason, shouldDelete);

    if (shouldDelete) {
      res.json({
        success: true,
        message: `Material flagged and immediately deleted by ${faculty.name}. Student points reduced by 20 penalty points.`,
        data: result
      });
    } else {
      res.json({
        success: true,
        message: `Material flagged by ${faculty.name}. It is now hidden from students and scheduled for automatic deletion in 2 days.`,
        data: result
      });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
