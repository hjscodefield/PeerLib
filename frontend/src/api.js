const API_BASE = '/api';

export const BRANCH_NAMES = {
  '01': 'CIVIL (01)',
  '02': 'EEE (02)',
  '03': 'MECH (03)',
  '04': 'ECE (04)',
  '05': 'CSE (05)',
  '30': 'AIDS (30)',
  '33': 'AIML (33)'
};

export const BRANCH_FULL_NAMES = {
  '01': 'CIVIL ENGINEERING (CIVIL)',
  '02': 'ELECTRICAL AND ELECTRONICS ENGINEERING (EEE)',
  '03': 'MECHANICAL ENGINEERING (MECH)',
  '04': 'ELECTRONICS AND COMMUNICATION ENGINEERING (ECE)',
  '05': 'COMPUTER SCIENCE AND ENGINEERING (CSE)',
  '30': 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE (AIDS)',
  '33': 'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING (AIML)'
};

export const CATEGORIES = [
  'Lecture Notes',
  'Assignment',
  'Own Notes',
  'Study Material',
  'Record'
];

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/stats/dashboard`);
  return res.json();
}

export async function fetchUploads(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/uploads?${query}`);
  return res.json();
}

export async function fetchUploadById(id, viewerRole = 'student', viewerId = null) {
  const query = new URLSearchParams({ viewer_role: viewerRole, viewer_id: viewerId || '' }).toString();
  const res = await fetch(`${API_BASE}/uploads/${id}?${query}`);
  return res.json();
}

export async function createUpload(formData) {
  const res = await fetch(`${API_BASE}/uploads`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}

export async function toggleLike(uploadId, userId) {
  const res = await fetch(`${API_BASE}/uploads/${uploadId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
  return res.json();
}

export async function addComment(uploadId, userId, commentText) {
  const res = await fetch(`${API_BASE}/uploads/${uploadId}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, comment_text: commentText })
  });
  return res.json();
}

export async function recommendUpload(uploadId, facultyId) {
  const res = await fetch(`${API_BASE}/uploads/${uploadId}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ faculty_id: facultyId })
  });
  return res.json();
}

export async function flagUpload(uploadId, facultyId, reason, action = 'flag') {
  const res = await fetch(`${API_BASE}/uploads/${uploadId}/flag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ faculty_id: facultyId, reason, action })
  });
  return res.json();
}

export async function fetchStudents(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/students?${query}`);
  return res.json();
}

export async function fetchStudentById(id, viewerId = null) {
  const query = viewerId ? `?viewer_id=${viewerId}` : '';
  const res = await fetch(`${API_BASE}/students/${id}${query}`);
  return res.json();
}

export async function toggleStarStudent(studentId, userId) {
  const res = await fetch(`${API_BASE}/students/${studentId}/star`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
  return res.json();
}

export async function fetchFaculty(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/faculty?${query}`);
  return res.json();
}

export async function fetchFacultyById(id) {
  const res = await fetch(`${API_BASE}/faculty/${id}`);
  return res.json();
}

export async function decodeRollEmail(email) {
  const res = await fetch(`${API_BASE}/auth/decode-roll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return res.json();
}

export async function registerStudent(data) {
  const res = await fetch(`${API_BASE}/auth/student-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function registerFaculty(data) {
  const res = await fetch(`${API_BASE}/auth/faculty-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function loginUser(email, role) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role })
  });
  return res.json();
}
