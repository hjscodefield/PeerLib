// API Test suite for PeerLib
async function runTests() {
  const BASE = 'http://localhost:5000';
  console.log('--- Testing PeerLib API ---');

  // 1. Health check
  const healthRes = await fetch(`${BASE}/api/health`);
  console.log('1. Health check status:', healthRes.status, await healthRes.json());

  // 2. Decode Roll No
  const decodeRes = await fetch(`${BASE}/api/auth/decode-roll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '24kb1a05ty@nbkrist.org' })
  });
  console.log('2. Decode Roll 24kb1a05ty@nbkrist.org:', await decodeRes.json());

  // 3. Test Invalid Domain
  const invalidDomainRes = await fetch(`${BASE}/api/auth/decode-roll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@gmail.com' })
  });
  console.log('3. Test Non-nbkrist.org domain:', await invalidDomainRes.json());

  // 4. Fetch Dashboard Stats
  const dashRes = await fetch(`${BASE}/api/stats/dashboard`);
  const dashData = await dashRes.json();
  console.log('4. Dashboard Best Profile:', dashData.data?.best_profile?.name, 'Trending count:', dashData.data?.trending?.length);

  // 5. Fetch Uploads with student viewer role
  const uploadsRes = await fetch(`${BASE}/api/uploads?viewer_role=student`);
  const uploadsData = await uploadsRes.json();
  console.log('5. Uploads fetched for student (count):', uploadsData.count);
  const flagged = uploadsData.data.find(u => u.is_flagged);
  console.log('   Flagged item for student access_blocked:', flagged?.access_blocked, 'can_download:', flagged?.can_download);

  // 6. Test Download on Flagged Upload (should be 403 Forbidden)
  if (flagged) {
    const dlRes = await fetch(`${BASE}/api/uploads/${flagged.id}/download`);
    console.log('6. Download flagged upload status (expected 403):', dlRes.status);
  }

  // 7. Toggle like on upload #1
  const likeRes = await fetch(`${BASE}/api/uploads/1/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: 3 })
  });
  console.log('7. Toggle Like result:', await likeRes.json());

  // 8. Test Student Profile Starring
  const starRes = await fetch(`${BASE}/api/students/1/star`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: 2 })
  });
  console.log('8. Star Student Profile result:', await starRes.json());

  console.log('--- ALL TESTS COMPLETED SUCCESSFULLY ---');
}

runTests().catch(console.error);
