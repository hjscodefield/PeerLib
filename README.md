# PeerLib 📚
### Community Social Platform for NBKRIST Students & Faculty to Share Study Materials

PeerLib is a dedicated academic resource sharing and social peer network engineered specifically for **N.B.K.R. Institute of Science & Technology (NBKRIST)**. It enables students and faculty members to exchange lecture notes, assignment question banks, laboratory records, and study guides with peer validation, faculty recommendations, and strict academic integrity moderation.

---

## 🎨 Ocean Color Palette Mapping

The application is styled with the designated high-contrast, glare-free Ocean Palette:

| Token | Hex Code | Role in PeerLib UI |
|---|---|---|
| **Primary** | `#082F49` (Deep Slate Navy) | Main headings, top navigation bar, primary text, bold container outlines. |
| **Secondary** | `#0E7490` (Deep Teal) | Card titles, active navigation tabs, filter chips, action buttons. |
| **Accent** | `#22D3EE` (Electric Cyan) | "Faculty Verified" badges, active glow states, rating stars, hover effects, CTAs. |
| **Support** | `#CFFAFE` (Soft Cyan/Ice Tint) | Subtle card headers, tag backgrounds, notification banners, hover fills. |
| **Background** | `#F0FDFA` (Mint Ice) | Soft, ultra-clean background eliminating screen glare. |

---

## ⚡ Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + Google Plus Jakarta Sans font
- **Backend**: Node.js + Express.js REST API + Multer (File Handling)
- **Database**: MySQL 8.0+ supported (`backend/database/schema.sql`) with dual-mode zero-config fallback (`backend/database/peerlib_store.json`)
- **Branding Icon**: Custom open book brand icon embedded in Navbar, Favicon, Hero, and Upload Modal.

---

## 🔑 Core Features & Workflow

### 1. Registrations & Role Segregation

#### Student Registration
- **Strict Domain Enforcement**: Accepts only `@nbkrist.org` email domain. Other email domains are blocked with validation feedback.
- **Auto-Roll Number Extraction**: Extracts the roll number directly from the email prefix (e.g., `24kb1a05ty@nbkrist.org` $\rightarrow$ `24KB1A05TY`).
- **Auto-Branch Decoding**: Automatically parses the 3rd and 4th digits from right of the roll number:
  - `01`: CIVIL ENGINEERING (CIVIL)
  - `02`: ELECTRICAL AND ELECTRONICS ENGINEERING (EEE)
  - `03`: MECHANICAL ENGINEERING (MECH)
  - `04`: ELECTRONICS AND COMMUNICATION ENGINEERING (ECE)
  - `05`: COMPUTER SCIENCE AND ENGINEERING (CSE)
  - `30`: ARTIFICIAL INTELLIGENCE AND DATA SCIENCE (AIDS)
  - `33`: ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING (AIML)
- **Manual Student Inputs**: Students type their name and select their current study year ($1$ to $4$).

#### Faculty Registration
- Any email is allowed for faculty.
- Manual selection of faculty name, dealing branch, dealing years (e.g. `2, 3`), and sections (e.g. `CSE-A, CSE-B`).

---

### 2. Study Material Uploads

- **Supported Document Types**: `.pdf`, `.doc`, `.docx`, `.txt`, `.pptx`.
- **Allowed Categories**:
  1. `Lecture Notes`
  2. `Assignment`
  3. `Own Notes`
  4. `Study Material`
  5. `Record`
- **Assignment Integrity Warning (Immediate Warning Trigger)**:
  - As soon as a user selects `Assignment` from the dropdown, an immediate warning banner appears:
    > **⚠️ ACADEMIC INTEGRITY WARNING: You must upload ASSIGNMENT QUESTIONS ONLY!**  
    > Posting assignment solutions or answers is strictly prohibited and subject to immediate deletion and reputation deduction.
  - Requires explicit certification check: *"I certify that this document contains only Assignment Questions, not solutions."*

---

### 3. Faculty Profile & Moderation Rules

- **Faculty Recommendation**: Faculty can mark high-quality materials as **Faculty Recommended**. This awards an **Electric Cyan Verified Badge** on the post and rewards the student author with **+25 reputation points**.
- **Faculty Comments & Feedback**: Faculty can comment with academic advice and suggestions on any post.
- **Flagging System**:
  - When flagged, a post **cannot be downloaded by anyone**.
  - **Students cannot view or download** flagged uploads (restricted locked state).
  - **Faculty members can view** flagged uploads for review, but download remains disabled.
  - Shows: *"Flagged by [Faculty Name] - automatically deleted after 2 days"*.
  - Automatically deleted after $48$ hours.
- **Immediate Flag & Delete**:
  - Faculty can delete infringing material immediately.
  - Applies a **$-20$ penalty points** reduction to the student profile.
- **Faculty Exemption Rule**:
  - Faculty can **only flag student uploads**, never fellow faculty uploads.

---

### 4. Reputation Matrix & Social Interactions

- **Likes**: Students and faculty can like posts (Author receives $+2$ points).
- **Profile Stars**: Anyone can star a student profile (Student receives $+5$ points).
- **Upload Reward**: $+10$ points per uploaded study material.
- **Faculty Endorsement**: $+25$ points for faculty recommendation.
- **Infringement Penalty**: $-20$ points for flagged & deleted materials.
- **Best Profile of the Week**: Spotlights the top student on the dashboard with stars, points, badges, and top uploads.

---

## 🚀 Quick Start Guide

### 1. Start the Full-Stack Application

From the root directory:

```bash
# Start the full-stack server (serves REST API and React frontend on http://localhost:5000)
npm start
```

Open your browser to:
**`http://localhost:5000`**

### 2. Running in Development Mode

If you wish to run the backend and frontend separately with live hot-reloading:

```bash
# Terminal 1: Backend API (port 5000)
cd backend
npm start

# Terminal 2: React Frontend with Vite (port 3000)
cd frontend
npm run dev
```

Open **`http://localhost:3000`** (Vite proxies all `/api` calls directly to port 5000).

---

## 🗄️ MySQL Database Setup (Optional)

PeerLib is pre-configured with a dual-mode database engine. By default, it operates with zero external setup using an embedded local store populated with realistic NBKRIST seed data.

To connect PeerLib to a live MySQL instance:

1. Open MySQL Workbench or MySQL CLI:
   ```sql
   source backend/database/schema.sql;
   ```
2. In `backend/.env`, set:
   ```env
   USE_MYSQL=true
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=peerlib_db
   ```
3. Restart `npm start`. The server will output:
   `🐬 Connected successfully to MySQL (localhost:3306/peerlib_db)`

---

## 🧪 Testing the API

Run the automated integration test script:
```bash
npm run test:api
```

Verifies:
- `@nbkrist.org` domain validation
- Roll number and branch code extraction (`24kb1a05ty` $\rightarrow$ `CSE (05)`)
- Flagged document 403 download block
- Profile starring and point increments
- Faculty recommendation bonuses
