-- PeerLib: NBKRIST Student & Faculty Study Sharing Platform
-- Database: MySQL 8.0+

CREATE DATABASE IF NOT EXISTS peerlib_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE peerlib_db;

-- 1. Users Table (Students & Faculty)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('student', 'faculty') NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50) NULL UNIQUE,            -- e.g. 24kb1a05ty, auto-fetched from email
    branch_code VARCHAR(10) NULL,               -- e.g. 05, 30, 33, 04, 02, 03, 01
    branch_name VARCHAR(150) NULL,              -- e.g. COMPUTER SCIENCE AND ENGINEERING (CSE)
    year INT NULL CHECK (year BETWEEN 1 AND 4),  -- Student year (1 to 4)
    dealing_branch VARCHAR(255) NULL,           -- Faculty dealing branch
    dealing_year VARCHAR(100) NULL,             -- Faculty dealing year(s)
    sections VARCHAR(100) NULL,                 -- Faculty sections (e.g. A, B, C)
    stars_count INT DEFAULT 0,                  -- Number of stars received on student profile
    points INT DEFAULT 100,                     -- Reputation score (+10 upload, +2 like, +5 star, +25 recommended, -20 flagged & deleted)
    avatar_url VARCHAR(500) NULL,
    bio TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_branch (branch_code),
    INDEX idx_user_year (year)
) ENGINE=InnoDB;

-- 2. Study Material Uploads Table
CREATE TABLE IF NOT EXISTS uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role ENUM('student', 'faculty') NOT NULL,
    title VARCHAR(255) NOT NULL,
    category ENUM('Lecture Notes', 'Assignment', 'Own Notes', 'Study Material', 'Record') NOT NULL,
    subject VARCHAR(255) NOT NULL,               -- e.g. C Programming, Python, DSA
    year INT NOT NULL CHECK (year BETWEEN 1 AND 4),
    branch_code VARCHAR(10) NOT NULL,
    branch_name VARCHAR(150) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) DEFAULT 'application/pdf',
    file_size VARCHAR(50) DEFAULT '1.2 MB',
    description TEXT NULL,
    likes_count INT DEFAULT 0,
    
    -- Faculty Recommendation feature
    is_faculty_recommended TINYINT(1) DEFAULT 0,
    recommended_by_faculty_id INT NULL,
    recommended_by_faculty_name VARCHAR(255) NULL,
    recommended_at TIMESTAMP NULL,
    
    -- Faculty Flagging & Scheduled Auto-Deletion (2 days)
    is_flagged TINYINT(1) DEFAULT 0,
    flagged_by_faculty_id INT NULL,
    flagged_by_faculty_name VARCHAR(255) NULL,
    flagged_reason TEXT NULL,
    flagged_at TIMESTAMP NULL,
    auto_delete_at TIMESTAMP NULL,              -- Scheduled deletion timestamp (flagged_at + 2 DAYS)
    
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_upload_category (category),
    INDEX idx_upload_branch (branch_code),
    INDEX idx_upload_year (year),
    INDEX idx_upload_flagged (is_flagged)
) ENGINE=InnoDB;

-- 3. Likes Table
CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upload_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_upload_like (upload_id, user_id),
    FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Profile Stars Table (Student Profile Starring)
CREATE TABLE IF NOT EXISTS stars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,                   -- Student receiving the star
    starred_by_user_id INT NOT NULL,           -- User (student or faculty) giving the star
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_student_star (student_id, starred_by_user_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (starred_by_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upload_id INT NOT NULL,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role ENUM('student', 'faculty') NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Moderation Logs Table
CREATE TABLE IF NOT EXISTS moderation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upload_id INT NOT NULL,
    faculty_id INT NOT NULL,
    faculty_name VARCHAR(255) NOT NULL,
    student_id INT NOT NULL,
    action ENUM('flag', 'flag_delete', 'recommend') NOT NULL,
    reason TEXT NULL,
    penalty_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ========================================================
-- INITIAL SEED DATA (STUDENTS, FACULTY & STUDY MATERIALS)
-- ========================================================

INSERT IGNORE INTO users (id, role, email, name, roll_no, branch_code, branch_name, year, dealing_branch, dealing_year, sections, stars_count, points, avatar_url, bio)
VALUES
(1, 'student', '22kb1a0512@nbkrist.org', 'Kavya Sharma', '22KB1A0512', '05', 'COMPUTER SCIENCE AND ENGINEERING (CSE)', 3, NULL, NULL, NULL, 142, 480, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '3rd Year CSE student passionate about Operating Systems, DSA, and open study resources.'),
(2, 'student', '23kb1a3021@nbkrist.org', 'Rahul Varma', '23KB1A3021', '30', 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE (AIDS)', 2, NULL, NULL, NULL, 98, 320, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '2nd Year AIDS student exploring Machine Learning & Data Analytics.'),
(3, 'student', '24kb1a05ty@nbkrist.org', 'Teja Yadav', '24KB1A05TY', '05', 'COMPUTER SCIENCE AND ENGINEERING (CSE)', 1, NULL, NULL, NULL, 45, 160, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '1st Year CSE fresher eager to learn C Programming and Web Technologies.'),
(4, 'student', '21kb1a0405@nbkrist.org', 'Sneha Reddy', '21KB1A0405', '04', 'ELECTRONICS AND COMMUNICATION ENGINEERING (ECE)', 4, NULL, NULL, NULL, 115, 410, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Final Year ECE enthusiast working on VLSI and Embedded Systems.'),
(5, 'student', '22kb1a3319@nbkrist.org', 'Ananya Iyer', '22KB1A3319', '33', 'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING (AIML)', 3, NULL, NULL, NULL, 88, 290, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'Deep Learning researcher and AIML 3rd year student.'),
(6, 'student', '23kb1a0210@nbkrist.org', 'Manoj Kumar', '23KB1A0210', '02', 'ELECTRICAL AND ELECTRONICS ENGINEERING (EEE)', 2, NULL, NULL, NULL, 62, 210, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'Power systems, circuits and renewable energy student.'),
(7, 'student', '21kb1a0108@nbkrist.org', 'Sai Charan', '21KB1A0108', '01', 'CIVIL ENGINEERING (CIVIL)', 4, NULL, NULL, NULL, 54, 190, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'Structural design & civil architecture senior.'),
(8, 'faculty', 'ksrinivas.cse@nbkrist.org', 'Dr. K. Srinivas', NULL, NULL, NULL, NULL, 'COMPUTER SCIENCE AND ENGINEERING (CSE)', '2, 3', 'CSE-A, CSE-B', 0, 0, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Professor & HOD i/c, Dept of CSE. Passionate about Operating Systems and Computer Architecture.'),
(9, 'faculty', 'pradhika.ai@nbkrist.org', 'Dr. P. Radhika', NULL, NULL, NULL, NULL, 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE (AIDS)', '2, 3', 'AIDS-A, AIML-A', 0, 0, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'Associate Professor in AI & Data Science. Mentor for Machine Learning and Data Science research.'),
(10, 'faculty', 'mvenkatrao.ece@nbkrist.org', 'Prof. M. Venkat Rao', NULL, NULL, NULL, NULL, 'ELECTRONICS AND COMMUNICATION ENGINEERING (ECE)', '3, 4', 'ECE-A, ECE-B, ECE-C', 0, 0, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'Professor, Dept of ECE. Specialization in Digital Signal Processing & Communication Systems.');

INSERT IGNORE INTO uploads (id, user_id, user_name, user_role, title, category, subject, year, branch_code, branch_name, file_name, file_url, file_type, file_size, description, likes_count, is_faculty_recommended, recommended_by_faculty_id, recommended_by_faculty_name, recommended_at, is_flagged, is_deleted)
VALUES
(1, 1, 'Kavya Sharma', 'student', 'Operating Systems Comprehensive Unit 1-4 Notes', 'Lecture Notes', 'Operating Systems', 3, '05', 'COMPUTER SCIENCE AND ENGINEERING (CSE)', 'OS_Complete_Lecture_Notes_Unit1_4.pdf', '/sample_docs/os_notes.pdf', 'application/pdf', '3.4 MB', 'Handwritten and typed consolidated lecture notes covering Process Scheduling, Deadlocks, Virtual Memory, and File Systems.', 48, 1, 8, 'Dr. K. Srinivas', NOW(), 0, 0),
(2, 8, 'Dr. K. Srinivas', 'faculty', 'Advanced C Programming & Dynamic Memory Management Handout', 'Study Material', 'C Programming', 1, '05', 'COMPUTER SCIENCE AND ENGINEERING (CSE)', 'Advanced_C_Memory_Pointers_Official.pdf', '/sample_docs/advanced_c.pdf', 'application/pdf', '2.1 MB', 'Official department reference material explaining double pointers, memory layouts, malloc/calloc/realloc, and struct alignment.', 67, 1, 8, 'Dr. K. Srinivas', NOW(), 0, 0),
(3, 2, 'Rahul Varma', 'student', 'Data Structures & Algorithms Laboratory Record (Complete)', 'Record', 'Data Structures', 2, '30', 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE (AIDS)', 'DSA_Lab_Record_Clean_Formatted.pdf', '/sample_docs/dsa_record.pdf', 'application/pdf', '4.8 MB', 'Cleanly formatted record with complete algorithm descriptions, C code implementations, and sample terminal I/O for all experiments.', 39, 1, 9, 'Dr. P. Radhika', NOW(), 0, 0),
(4, 3, 'Teja Yadav', 'student', 'Assignment 1 Questions - Problem Solving through C', 'Assignment', 'C Programming', 1, '05', 'COMPUTER SCIENCE AND ENGINEERING (CSE)', 'C_Programming_Assignment1_Questions.pdf', '/sample_docs/c_assignment_q.pdf', 'application/pdf', '1.1 MB', 'Notice: Contains ONLY question statements and problem specifications for Assignment 1. No answers or code solutions included.', 22, 0, NULL, NULL, NULL, 0, 0),
(5, 4, 'Sneha Reddy', 'student', 'Digital Signal Processing Formula Sheet & Mind Map', 'Own Notes', 'Digital Signal Processing', 4, '04', 'ELECTRONICS AND COMMUNICATION ENGINEERING (ECE)', 'DSP_Quick_Formulae_CheatSheet.pdf', '/sample_docs/dsp_formulas.pdf', 'application/pdf', '1.8 MB', 'Self-prepared comprehensive cheat sheet covering DFT, FFT algorithms, bilinear transformation, and Butterworth filter equations.', 53, 1, 10, 'Prof. M. Venkat Rao', NOW(), 0, 0);

INSERT IGNORE INTO comments (id, upload_id, user_id, user_name, user_role, comment_text)
VALUES
(1, 1, 8, 'Dr. K. Srinivas', 'faculty', 'Very well structured notes! The diagrams clearly clarify multi-level page table translation. Highly recommended for CSE 3rd years.'),
(2, 1, 3, 'Teja Yadav', 'student', 'Thank you Kavya senior! This helped clarify page faults for my internals preparation.'),
(3, 3, 9, 'Dr. P. Radhika', 'faculty', 'Neat algorithm representations Rahul. Please ensure all students also document the time and space complexity in their final lab submissions.');
