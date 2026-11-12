// Database layer for PeerLib supporting both MySQL and Local JSON persistence
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { initialUsers, initialUploads, initialComments, initialLikes, initialStars } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, 'peerlib_store.json');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Configuration for MySQL (can be configured via environment variables)
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'peerlib_db';
const DB_PORT = process.env.DB_PORT || 3306;

let mysqlPool = null;
let useMySQL = false;

// Local JSON store in-memory state
let localStore = {
  users: [],
  uploads: [],
  comments: [],
  likes: [],
  stars: [],
  moderationLogs: []
};

// Initialize Local Store
function initLocalStore() {
  if (fs.existsSync(STORE_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
      localStore = data;
      console.log('📦 Loaded existing PeerLib local database.');
      return;
    } catch (e) {
      console.warn('⚠️ Could not parse existing store, creating fresh store with seed data.');
    }
  }

  localStore = {
    users: JSON.parse(JSON.stringify(initialUsers)),
    uploads: JSON.parse(JSON.stringify(initialUploads)),
    comments: JSON.parse(JSON.stringify(initialComments)),
    likes: JSON.parse(JSON.stringify(initialLikes)),
    stars: JSON.parse(JSON.stringify(initialStars)),
    moderationLogs: []
  };
  saveLocalStore();
  console.log('✨ Initialized PeerLib database with NBKRIST seed data.');
}

function saveLocalStore() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(localStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to local store file:', err);
  }
}

// Check and cleanup flagged posts older than 2 days (48 hours)
async function runAutoDeleteCheck() {
  const now = new Date();

  if (useMySQL && mysqlPool) {
    try {
      const [flaggedItems] = await mysqlPool.query(
        'SELECT id, title, auto_delete_at FROM uploads WHERE is_flagged = 1 AND is_deleted = 0 AND auto_delete_at IS NOT NULL'
      );
      for (const item of flaggedItems) {
        if (now >= new Date(item.auto_delete_at)) {
          await mysqlPool.query('UPDATE uploads SET is_deleted = 1 WHERE id = ?', [item.id]);
          console.log(`⏰ [MySQL] Auto-deleted flagged upload ID #${item.id} (${item.title}) after 2 days.`);
        }
      }
    } catch (err) {
      console.error('MySQL auto delete check error:', err.message);
    }
    return;
  }

  // Local store auto delete
  let modified = false;
  localStore.uploads = localStore.uploads.filter(item => {
    if (item.is_flagged && item.auto_delete_at) {
      const deleteAt = new Date(item.auto_delete_at);
      if (now >= deleteAt) {
        console.log(`⏰ Auto-deleted flagged upload ID #${item.id} (${item.title}) after 2 days.`);
        modified = true;
        return false;
      }
    }
    return true;
  });
  if (modified) {
    saveLocalStore();
  }
}

// Periodic auto delete check every 30 minutes
setInterval(runAutoDeleteCheck, 30 * 60 * 1000);

// Setup MySQL tables and seed if empty
async function setupMySQLTables() {
  try {
    // Read and run schema.sql
    if (fs.existsSync(SCHEMA_PATH)) {
      const sqlContent = fs.readFileSync(SCHEMA_PATH, 'utf-8');
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.toUpperCase().startsWith('CREATE DATABASE') && !s.toUpperCase().startsWith('USE'));

      for (const statement of statements) {
        await mysqlPool.query(statement);
      }
      console.log('✅ MySQL schema tables verified/created successfully.');
    }

    // Check if users exist in MySQL
    const [rows] = await mysqlPool.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      console.log('🌱 Populating MySQL database with NBKRIST initial seed data...');
      for (const u of initialUsers) {
        await mysqlPool.query(
          `INSERT INTO users (id, role, email, name, roll_no, branch_code, branch_name, year, dealing_branch, dealing_year, sections, stars_count, points, avatar_url, bio, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            u.id, u.role, u.email, u.name, u.roll_no || null, u.branch_code || null,
            u.branch_name || null, u.year || null, u.dealing_branch || null,
            u.dealing_year || null, u.sections || null, u.stars_count || 0,
            u.points || 0, u.avatar_url || null, u.bio || null, u.created_at || new Date()
          ]
        );
      }

      for (const up of initialUploads) {
        await mysqlPool.query(
          `INSERT INTO uploads (id, user_id, user_name, user_role, title, category, subject, year, branch_code, branch_name, file_name, file_url, file_type, file_size, description, likes_count, is_faculty_recommended, recommended_by_faculty_id, recommended_by_faculty_name, recommended_at, is_flagged, flagged_by_faculty_id, flagged_by_faculty_name, flagged_reason, flagged_at, auto_delete_at, is_deleted, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            up.id, up.user_id, up.user_name, up.user_role, up.title, up.category, up.subject, up.year,
            up.branch_code, up.branch_name, up.file_name, up.file_url, up.file_type, up.file_size,
            up.description, up.likes_count, up.is_faculty_recommended, up.recommended_by_faculty_id,
            up.recommended_by_faculty_name, up.recommended_at, up.is_flagged, up.flagged_by_faculty_id,
            up.flagged_by_faculty_name, up.flagged_reason, up.flagged_at, up.auto_delete_at, up.is_deleted, up.created_at
          ]
        );
      }

      for (const c of initialComments) {
        await mysqlPool.query(
          `INSERT INTO comments (id, upload_id, user_id, user_name, user_role, comment_text, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [c.id, c.upload_id, c.user_id, c.user_name, c.user_role, c.comment_text, c.created_at]
        );
      }

      for (const l of initialLikes) {
        await mysqlPool.query(
          `INSERT IGNORE INTO likes (upload_id, user_id) VALUES (?, ?)`,
          [l.upload_id, l.user_id]
        );
      }

      for (const s of initialStars) {
        await mysqlPool.query(
          `INSERT IGNORE INTO stars (student_id, starred_by_user_id) VALUES (?, ?)`,
          [s.student_id, s.starred_by_user_id]
        );
      }

      console.log('✨ Seeded MySQL with NBKRIST students, faculty, and materials.');
    }
  } catch (err) {
    console.error('MySQL table setup warning:', err.message);
  }
}

// Initialize DB engine
export async function initDatabase() {
  try {
    // Attempt MySQL connection if explicitly set or available
    if (process.env.USE_MYSQL === 'true') {
      // First connect without DB to ensure database exists
      const tempConn = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        port: Number(DB_PORT)
      });
      await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await tempConn.end();

      mysqlPool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: Number(DB_PORT),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test ping
      await mysqlPool.query('SELECT 1');
      useMySQL = true;
      console.log(`🐬 Connected successfully to MySQL (${DB_HOST}:${DB_PORT}/${DB_NAME})`);
      await setupMySQLTables();
      await runAutoDeleteCheck();
      return;
    }
  } catch (err) {
    console.warn(`⚠️ MySQL connection could not be established: ${err.message}`);
    console.warn(`👉 Running with seamless local embedded database store.`);
  }

  // Fallback to local store
  useMySQL = false;
  initLocalStore();
  await runAutoDeleteCheck();
}

// Database query and helper operations
export const db = {
  isMySQL() {
    return useMySQL;
  },

  // USERS
  async getUsers(role = null, branch = null, year = null) {
    if (useMySQL && mysqlPool) {
      let sql = 'SELECT * FROM users WHERE 1=1';
      const params = [];
      if (role) {
        sql += ' AND role = ?';
        params.push(role);
      }
      if (branch) {
        sql += ' AND (branch_code = ? OR dealing_branch LIKE ?)';
        params.push(branch, `%${branch}%`);
      }
      if (year) {
        sql += ' AND (year = ? OR dealing_year LIKE ?)';
        params.push(Number(year), `%${year}%`);
      }
      sql += ' ORDER BY points DESC, stars_count DESC';
      const [rows] = await mysqlPool.query(sql, params);
      return rows;
    }

    let list = localStore.users;
    if (role) list = list.filter(u => u.role === role);
    if (branch) list = list.filter(u => u.branch_code === branch || u.dealing_branch?.includes(branch));
    if (year) list = list.filter(u => String(u.year) === String(year) || u.dealing_year?.includes(String(year)));
    return list;
  },

  async getUserById(id) {
    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query('SELECT * FROM users WHERE id = ?', [Number(id)]);
      return rows[0] || null;
    }
    return localStore.users.find(u => Number(u.id) === Number(id)) || null;
  },

  async getUserByEmail(email) {
    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
      return rows[0] || null;
    }
    return localStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createUser(userData) {
    const avatar = userData.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(userData.name)}`;
    const points = userData.role === 'student' ? 100 : 0;
    const now = new Date();

    if (useMySQL && mysqlPool) {
      const [result] = await mysqlPool.query(
        `INSERT INTO users (role, email, name, roll_no, branch_code, branch_name, year, dealing_branch, dealing_year, sections, stars_count, points, avatar_url, bio, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
        [
          userData.role, userData.email, userData.name, userData.roll_no || null,
          userData.branch_code || null, userData.branch_name || null, userData.year || null,
          userData.dealing_branch || null, userData.dealing_year || null, userData.sections || null,
          points, avatar, userData.bio || null, now
        ]
      );
      return { id: result.insertId, ...userData, avatar_url: avatar, points, stars_count: 0, created_at: now.toISOString() };
    }

    const newId = localStore.users.length ? Math.max(...localStore.users.map(u => u.id)) + 1 : 1;
    const user = {
      id: newId,
      stars_count: 0,
      points,
      avatar_url: avatar,
      created_at: now.toISOString(),
      ...userData
    };
    localStore.users.push(user);
    saveLocalStore();
    return user;
  },

  async updateUser(id, updates) {
    if (useMySQL && mysqlPool) {
      const keys = Object.keys(updates);
      if (keys.length === 0) return this.getUserById(id);
      const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
      const values = [...keys.map(k => updates[k]), Number(id)];
      await mysqlPool.query(`UPDATE users SET ${setClause} WHERE id = ?`, values);
      return this.getUserById(id);
    }

    const user = localStore.users.find(u => Number(u.id) === Number(id));
    if (user) {
      Object.assign(user, updates);
      saveLocalStore();
    }
    return user;
  },

  // UPLOADS
  async getUploads({ category, branch, year, search, user_id, viewer_role = 'student' }) {
    await runAutoDeleteCheck();

    if (useMySQL && mysqlPool) {
      let sql = 'SELECT * FROM uploads WHERE is_deleted = 0';
      const params = [];
      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }
      if (branch) {
        sql += ' AND branch_code = ?';
        params.push(branch);
      }
      if (year) {
        sql += ' AND year = ?';
        params.push(Number(year));
      }
      if (user_id) {
        sql += ' AND user_id = ?';
        params.push(Number(user_id));
      }
      if (search) {
        sql += ' AND (LOWER(title) LIKE ? OR LOWER(subject) LIKE ? OR LOWER(user_name) LIKE ? OR LOWER(description) LIKE ?)';
        const q = `%${search.toLowerCase()}%`;
        params.push(q, q, q, q);
      }
      sql += ' ORDER BY is_faculty_recommended DESC, likes_count DESC, created_at DESC';
      const [rows] = await mysqlPool.query(sql, params);
      return rows;
    }

    let items = [...localStore.uploads].filter(u => !u.is_deleted);
    if (category) items = items.filter(u => u.category === category);
    if (branch) items = items.filter(u => u.branch_code === branch);
    if (year) items = items.filter(u => String(u.year) === String(year));
    if (user_id) items = items.filter(u => Number(u.user_id) === Number(user_id));
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(u => 
        u.title.toLowerCase().includes(q) ||
        u.subject.toLowerCase().includes(q) ||
        u.user_name.toLowerCase().includes(q) ||
        (u.description && u.description.toLowerCase().includes(q))
      );
    }
    items.sort((a, b) => {
      if (b.is_faculty_recommended !== a.is_faculty_recommended) {
        return b.is_faculty_recommended - a.is_faculty_recommended;
      }
      return b.likes_count - a.likes_count || new Date(b.created_at) - new Date(a.created_at);
    });
    return items;
  },

  async getUploadById(id) {
    await runAutoDeleteCheck();
    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query('SELECT * FROM uploads WHERE id = ? AND is_deleted = 0', [Number(id)]);
      return rows[0] || null;
    }
    return localStore.uploads.find(u => Number(u.id) === Number(id) && !u.is_deleted) || null;
  },

  async createUpload(data) {
    const now = new Date();

    if (useMySQL && mysqlPool) {
      const [result] = await mysqlPool.query(
        `INSERT INTO uploads (user_id, user_name, user_role, title, category, subject, year, branch_code, branch_name, file_name, file_url, file_type, file_size, description, likes_count, is_faculty_recommended, is_flagged, is_deleted, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?)`,
        [
          data.user_id, data.user_name, data.user_role, data.title, data.category, data.subject,
          Number(data.year), data.branch_code, data.branch_name, data.file_name, data.file_url,
          data.file_type || 'application/pdf', data.file_size || '1.5 MB', data.description || '', now
        ]
      );

      // Increase student points by 10
      if (data.user_role === 'student') {
        await mysqlPool.query('UPDATE users SET points = points + 10 WHERE id = ?', [data.user_id]);
      }

      return {
        id: result.insertId,
        ...data,
        likes_count: 0,
        is_faculty_recommended: 0,
        is_flagged: 0,
        is_deleted: 0,
        created_at: now.toISOString()
      };
    }

    const newId = localStore.uploads.length ? Math.max(...localStore.uploads.map(u => u.id)) + 1 : 1;
    const upload = {
      id: newId,
      likes_count: 0,
      is_faculty_recommended: 0,
      recommended_by_faculty_id: null,
      recommended_by_faculty_name: null,
      recommended_at: null,
      is_flagged: 0,
      flagged_by_faculty_id: null,
      flagged_by_faculty_name: null,
      flagged_reason: null,
      flagged_at: null,
      auto_delete_at: null,
      is_deleted: 0,
      created_at: now.toISOString(),
      ...data
    };
    localStore.uploads.unshift(upload);

    if (upload.user_role === 'student') {
      const student = localStore.users.find(u => Number(u.id) === Number(upload.user_id));
      if (student) {
        student.points = (student.points || 0) + 10;
      }
    }

    saveLocalStore();
    return upload;
  },

  // LIKES
  async toggleLike(uploadId, userId) {
    const uId = Number(uploadId);
    const usrId = Number(userId);

    if (useMySQL && mysqlPool) {
      const [existing] = await mysqlPool.query('SELECT id FROM likes WHERE upload_id = ? AND user_id = ?', [uId, usrId]);
      let liked = false;
      if (existing.length > 0) {
        await mysqlPool.query('DELETE FROM likes WHERE upload_id = ? AND user_id = ?', [uId, usrId]);
        await mysqlPool.query('UPDATE uploads SET likes_count = GREATEST(0, likes_count - 1) WHERE id = ?', [uId]);
        liked = false;
      } else {
        await mysqlPool.query('INSERT INTO likes (upload_id, user_id) VALUES (?, ?)', [uId, usrId]);
        await mysqlPool.query('UPDATE uploads SET likes_count = likes_count + 1 WHERE id = ?', [uId]);
        // Reward author 2 points
        const [uploadRow] = await mysqlPool.query('SELECT user_id, user_role FROM uploads WHERE id = ?', [uId]);
        if (uploadRow[0] && uploadRow[0].user_role === 'student') {
          await mysqlPool.query('UPDATE users SET points = points + 2 WHERE id = ?', [uploadRow[0].user_id]);
        }
        liked = true;
      }
      const [updatedUpload] = await mysqlPool.query('SELECT likes_count FROM uploads WHERE id = ?', [uId]);
      return { liked, likes_count: updatedUpload[0]?.likes_count || 0 };
    }

    const existingIndex = localStore.likes.findIndex(l => l.upload_id === uId && l.user_id === usrId);
    const upload = localStore.uploads.find(u => u.id === uId);
    let liked = false;
    if (existingIndex > -1) {
      localStore.likes.splice(existingIndex, 1);
      if (upload && upload.likes_count > 0) upload.likes_count--;
      liked = false;
    } else {
      localStore.likes.push({ upload_id: uId, user_id: usrId, created_at: new Date().toISOString() });
      if (upload) {
        upload.likes_count++;
        const author = localStore.users.find(u => u.id === upload.user_id);
        if (author && author.role === 'student') {
          author.points = (author.points || 0) + 2;
        }
      }
      liked = true;
    }
    saveLocalStore();
    return { liked, likes_count: upload ? upload.likes_count : 0 };
  },

  async getUserLikes(userId) {
    const usrId = Number(userId);
    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query('SELECT upload_id FROM likes WHERE user_id = ?', [usrId]);
      return rows.map(r => r.upload_id);
    }
    return localStore.likes.filter(l => l.user_id === usrId).map(l => l.upload_id);
  },

  // STARS (STUDENT PROFILE)
  async toggleStar(studentId, starredByUserId) {
    const targetStudentId = Number(studentId);
    const byUserId = Number(starredByUserId);

    if (useMySQL && mysqlPool) {
      const student = await this.getUserById(targetStudentId);
      if (!student || student.role !== 'student') {
        throw new Error("Only student profiles can be starred.");
      }

      const [existing] = await mysqlPool.query(
        'SELECT id FROM stars WHERE student_id = ? AND starred_by_user_id = ?',
        [targetStudentId, byUserId]
      );

      let starred = false;
      if (existing.length > 0) {
        await mysqlPool.query('DELETE FROM stars WHERE student_id = ? AND starred_by_user_id = ?', [targetStudentId, byUserId]);
        await mysqlPool.query('UPDATE users SET stars_count = GREATEST(0, stars_count - 1), points = GREATEST(0, points - 5) WHERE id = ?', [targetStudentId]);
        starred = false;
      } else {
        await mysqlPool.query('INSERT INTO stars (student_id, starred_by_user_id) VALUES (?, ?)', [targetStudentId, byUserId]);
        await mysqlPool.query('UPDATE users SET stars_count = stars_count + 1, points = points + 5 WHERE id = ?', [targetStudentId]);
        starred = true;
      }

      const updated = await this.getUserById(targetStudentId);
      return { starred, stars_count: updated.stars_count, points: updated.points };
    }

    const targetStudent = localStore.users.find(u => u.id === targetStudentId);
    if (!targetStudent || targetStudent.role !== 'student') {
      throw new Error("Only student profiles can be starred.");
    }

    const existingIndex = localStore.stars.findIndex(
      s => s.student_id === targetStudentId && s.starred_by_user_id === byUserId
    );

    let starred = false;
    if (existingIndex > -1) {
      localStore.stars.splice(existingIndex, 1);
      targetStudent.stars_count = Math.max(0, (targetStudent.stars_count || 0) - 1);
      targetStudent.points = Math.max(0, (targetStudent.points || 0) - 5);
      starred = false;
    } else {
      localStore.stars.push({
        student_id: targetStudentId,
        starred_by_user_id: byUserId,
        created_at: new Date().toISOString()
      });
      targetStudent.stars_count = (targetStudent.stars_count || 0) + 1;
      targetStudent.points = (targetStudent.points || 0) + 5;
      starred = true;
    }

    saveLocalStore();
    return { starred, stars_count: targetStudent.stars_count, points: targetStudent.points };
  },

  async getUserGivenStars(userId) {
    const usrId = Number(userId);
    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query('SELECT student_id FROM stars WHERE starred_by_user_id = ?', [usrId]);
      return rows.map(r => r.student_id);
    }
    return localStore.stars.filter(s => s.starred_by_user_id === usrId).map(s => s.student_id);
  },

  // COMMENTS
  async getComments(uploadId) {
    const uId = Number(uploadId);
    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query('SELECT * FROM comments WHERE upload_id = ? ORDER BY created_at ASC', [uId]);
      return rows;
    }
    return localStore.comments.filter(c => c.upload_id === uId);
  },

  async addComment(data) {
    const now = new Date();
    if (useMySQL && mysqlPool) {
      const [result] = await mysqlPool.query(
        `INSERT INTO comments (upload_id, user_id, user_name, user_role, comment_text, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [Number(data.upload_id), Number(data.user_id), data.user_name, data.user_role, data.comment_text, now]
      );
      return { id: result.insertId, ...data, created_at: now.toISOString() };
    }

    const newId = localStore.comments.length ? Math.max(...localStore.comments.map(c => c.id)) + 1 : 1;
    const comment = {
      id: newId,
      upload_id: Number(data.upload_id),
      user_id: Number(data.user_id),
      user_name: data.user_name,
      user_role: data.user_role,
      comment_text: data.comment_text,
      created_at: now.toISOString()
    };
    localStore.comments.push(comment);
    saveLocalStore();
    return comment;
  },

  // FACULTY MODERATION: RECOMMEND
  async recommendUpload(uploadId, facultyId, facultyName) {
    const uId = Number(uploadId);
    const fId = Number(facultyId);
    const now = new Date();

    if (useMySQL && mysqlPool) {
      const upload = await this.getUploadById(uId);
      if (!upload) throw new Error("Upload not found");

      await mysqlPool.query(
        `UPDATE uploads SET is_faculty_recommended = 1, recommended_by_faculty_id = ?, recommended_by_faculty_name = ?, recommended_at = ? WHERE id = ?`,
        [fId, facultyName, now, uId]
      );

      // Reward student with 25 points
      if (upload.user_role === 'student') {
        await mysqlPool.query('UPDATE users SET points = points + 25 WHERE id = ?', [upload.user_id]);
      }

      await mysqlPool.query(
        `INSERT INTO moderation_logs (upload_id, faculty_id, faculty_name, student_id, action, reason, penalty_points, created_at)
         VALUES (?, ?, ?, ?, 'recommend', 'Marked as Faculty Recommended', 0, ?)`,
        [uId, fId, facultyName, upload.user_id, now]
      );

      return this.getUploadById(uId);
    }

    const upload = localStore.uploads.find(u => u.id === uId);
    if (!upload) throw new Error("Upload not found");

    upload.is_faculty_recommended = 1;
    upload.recommended_by_faculty_id = fId;
    upload.recommended_by_faculty_name = facultyName;
    upload.recommended_at = now.toISOString();

    const author = localStore.users.find(u => u.id === upload.user_id);
    if (author && author.role === 'student') {
      author.points = (author.points || 0) + 25;
    }

    saveLocalStore();
    return upload;
  },

  // FACULTY MODERATION: FLAG OR FLAG & DELETE
  async flagUpload(uploadId, facultyId, facultyName, reason, shouldDelete = false) {
    const uId = Number(uploadId);
    const fId = Number(facultyId);
    const now = new Date();
    const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const upload = await this.getUploadById(uId);
    if (!upload) throw new Error("Upload not found");

    if (upload.user_role === 'faculty') {
      throw new Error("Faculty members can only flag student uploads, not fellow faculty uploads.");
    }

    if (useMySQL && mysqlPool) {
      if (shouldDelete) {
        await mysqlPool.query(
          `UPDATE uploads SET is_deleted = 1, is_flagged = 1, flagged_by_faculty_id = ?, flagged_by_faculty_name = ?, flagged_reason = ?, flagged_at = ? WHERE id = ?`,
          [fId, facultyName, reason || "Violated guidelines / flagged & deleted by faculty", now, uId]
        );
        // Penalty: -20 points
        await mysqlPool.query('UPDATE users SET points = GREATEST(0, points - 20) WHERE id = ?', [upload.user_id]);

        await mysqlPool.query(
          `INSERT INTO moderation_logs (upload_id, faculty_id, faculty_name, student_id, action, reason, penalty_points, created_at)
           VALUES (?, ?, ?, ?, 'flag_delete', ?, 20, ?)`,
          [uId, fId, facultyName, upload.user_id, reason || "Deleted by faculty", now]
        );

        const updatedStudent = await this.getUserById(upload.user_id);
        return { upload, deleted: true, penalty: 20, studentPoints: updatedStudent?.points };
      } else {
        await mysqlPool.query(
          `UPDATE uploads SET is_flagged = 1, flagged_by_faculty_id = ?, flagged_by_faculty_name = ?, flagged_reason = ?, flagged_at = ?, auto_delete_at = ? WHERE id = ?`,
          [fId, facultyName, reason || "Flagged for review", now, twoDaysLater, uId]
        );

        await mysqlPool.query(
          `INSERT INTO moderation_logs (upload_id, faculty_id, faculty_name, student_id, action, reason, penalty_points, created_at)
           VALUES (?, ?, ?, ?, 'flag', ?, 0, ?)`,
          [uId, fId, facultyName, upload.user_id, reason || "Flagged for review", now]
        );

        return { upload, deleted: false, auto_delete_at: twoDaysLater.toISOString() };
      }
    }

    // Local store implementation
    const author = localStore.users.find(u => u.id === upload.user_id);
    if (shouldDelete) {
      upload.is_deleted = 1;
      upload.is_flagged = 1;
      upload.flagged_by_faculty_id = fId;
      upload.flagged_by_faculty_name = facultyName;
      upload.flagged_reason = reason || "Violated academic guidelines / flagged & deleted by faculty";
      upload.flagged_at = now.toISOString();

      let penalty = 20;
      if (author && author.role === 'student') {
        author.points = Math.max(0, (author.points || 0) - penalty);
      }

      saveLocalStore();
      return { upload, deleted: true, penalty, studentPoints: author?.points };
    } else {
      upload.is_flagged = 1;
      upload.flagged_by_faculty_id = fId;
      upload.flagged_by_faculty_name = facultyName;
      upload.flagged_reason = reason || "Flagged for faculty review";
      upload.flagged_at = now.toISOString();
      upload.auto_delete_at = twoDaysLater.toISOString();

      saveLocalStore();
      return { upload, deleted: false, auto_delete_at: upload.auto_delete_at };
    }
  },

  // TRENDING AND BEST PROFILE
  async getTrendingUploads(limit = 6) {
    await runAutoDeleteCheck();
    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query(
        `SELECT * FROM uploads 
         WHERE is_deleted = 0 AND is_flagged = 0 
         ORDER BY (likes_count * 2 + (CASE WHEN is_faculty_recommended = 1 THEN 10 ELSE 0 END)) DESC, created_at DESC 
         LIMIT ?`,
        [Number(limit)]
      );
      return rows;
    }

    const active = localStore.uploads.filter(u => !u.is_deleted && !u.is_flagged);
    active.sort((a, b) => (b.likes_count * 2 + (b.is_faculty_recommended ? 10 : 0)) - (a.likes_count * 2 + (a.is_faculty_recommended ? 10 : 0)));
    return active.slice(0, limit);
  },

  async getBestProfileOfTheWeek() {
    if (useMySQL && mysqlPool) {
      const [students] = await mysqlPool.query(
        `SELECT * FROM users 
         WHERE role = 'student' 
         ORDER BY (points * 2 + stars_count * 3) DESC 
         LIMIT 1`
      );
      if (students.length === 0) return null;
      const topStudent = students[0];

      const [topUploads] = await mysqlPool.query(
        `SELECT * FROM uploads 
         WHERE user_id = ? AND is_deleted = 0 AND is_flagged = 0 
         ORDER BY likes_count DESC 
         LIMIT 3`,
        [topStudent.id]
      );

      return {
        ...topStudent,
        topUploads
      };
    }

    const students = localStore.users.filter(u => u.role === 'student');
    if (!students.length) return null;
    students.sort((a, b) => (b.points * 2 + b.stars_count * 3) - (a.points * 2 + a.stars_count * 3));
    const topStudent = students[0];
    const topUploads = localStore.uploads
      .filter(u => u.user_id === topStudent.id && !u.is_deleted && !u.is_flagged)
      .slice(0, 3);

    return {
      ...topStudent,
      topUploads
    };
  }
};
