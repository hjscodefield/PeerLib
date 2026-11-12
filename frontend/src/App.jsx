import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import StudentsView from './components/StudentsView';
import FacultyView from './components/FacultyView';
import MyProfileView from './components/MyProfileView';
import UploadModal from './components/UploadModal';
import AuthModal from './components/AuthModal';
import DocumentViewerModal from './components/DocumentViewerModal';
import { 
  fetchDashboardStats, 
  fetchUploads, 
  fetchStudents, 
  fetchFaculty, 
  fetchStudentById,
  toggleLike, 
  recommendUpload, 
  flagUpload, 
  toggleStarStudent,
  createUpload
} from './api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  
  // Dashboard & Content states
  const [dashboardData, setDashboardData] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeViewerMaterial, setActiveViewerMaterial] = useState(null);
  const [inspectingUser, setInspectingUser] = useState(null);

  // Initial Load
  useEffect(() => {
    initApp();
  }, []);

  // Refetch uploads whenever filters change or user role switches
  useEffect(() => {
    loadUploads();
  }, [selectedCategory, selectedBranch, searchQuery, currentUser?.role]);

  const initApp = async () => {
    try {
      setLoading(true);
      // Fetch students and faculty to populate users list
      const [studentsRes, facultyRes, dashRes] = await Promise.all([
        fetchStudents(),
        fetchFaculty(),
        fetchDashboardStats()
      ]);

      const combinedUsers = [
        ...(studentsRes.data || []),
        ...(facultyRes.data || [])
      ];
      setAllUsers(combinedUsers);

      // Default user: Kavya Sharma (Student) or first student
      if (studentsRes.data && studentsRes.data.length > 0) {
        setCurrentUser(studentsRes.data[0]);
      }

      setDashboardData(dashRes.data);
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUploads = async () => {
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBranch) params.branch = selectedBranch;
      if (searchQuery) params.search = searchQuery;
      if (currentUser?.role) params.viewer_role = currentUser.role;
      if (currentUser?.id) params.viewer_id = currentUser.id;

      const res = await fetchUploads(params);
      if (res.success) {
        setUploads(res.data);
      }
    } catch (err) {
      console.error('Failed to load uploads:', err);
    }
  };

  const refreshDashboard = async () => {
    try {
      const dashRes = await fetchDashboardStats();
      if (dashRes.success) {
        setDashboardData(dashRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Like handler
  const handleLike = async (uploadId) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const res = await toggleLike(uploadId, currentUser.id);
      if (res.success) {
        setUploads(uploads.map(u => {
          if (u.id === uploadId) {
            return {
              ...u,
              is_liked: res.liked,
              likes_count: res.likes_count
            };
          }
          return u;
        }));
        refreshDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle like.');
    }
  };

  // Star student handler
  const handleStarToggle = async (studentId) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const res = await toggleStarStudent(studentId, currentUser.id);
      if (res.success) {
        // If current user starred the best profile, update state
        if (dashboardData?.best_profile?.id === studentId) {
          setDashboardData({
            ...dashboardData,
            best_profile: {
              ...dashboardData.best_profile,
              is_starred: res.starred,
              stars_count: res.stars_count,
              points: res.points
            }
          });
        }
        refreshDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to star profile.');
    }
  };

  // Faculty Recommendation
  const handleRecommend = async (uploadId) => {
    if (currentUser?.role !== 'faculty') return;
    try {
      const res = await recommendUpload(uploadId, currentUser.id);
      if (res.success) {
        alert(res.message);
        loadUploads();
        refreshDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to recommend material.');
    }
  };

  // Faculty Flagging / Flag & Delete
  const handleFlag = async (uploadId, reason, action) => {
    if (currentUser?.role !== 'faculty') return;
    try {
      const res = await flagUpload(uploadId, currentUser.id, reason, action);
      if (res.success) {
        alert(res.message);
        loadUploads();
        refreshDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to flag material.');
    }
  };

  // Upload Submission
  const handleUploadSuccess = async (formData) => {
    const res = await createUpload(formData);
    if (res.success) {
      alert(res.message || 'Study material uploaded successfully!');
      loadUploads();
      refreshDashboard();
      setCurrentTab('dashboard');
    } else {
      throw new Error(res.message || 'Failed to upload.');
    }
  };

  // View specific student profile from Student Directory
  const handleSelectStudentProfile = async (studentId) => {
    try {
      const res = await fetchStudentById(studentId, currentUser?.id);
      if (res.success) {
        setInspectingUser(res.data);
        setCurrentTab('profile');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-ocean-background text-ocean-primary flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab !== 'profile') setInspectingUser(null);
          setCurrentTab(tab);
        }}
        currentUser={currentUser}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          setInspectingUser(null);
        }}
        allUsers={allUsers}
        onLogout={() => {
          setCurrentUser(null);
          setIsAuthOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {currentTab === 'dashboard' && (
          <Dashboard
            dashboardData={dashboardData}
            uploads={uploads}
            currentUser={currentUser}
            onLike={handleLike}
            onOpenViewer={(m) => setActiveViewerMaterial(m)}
            onRecommend={handleRecommend}
            onFlag={handleFlag}
            onStarToggle={handleStarToggle}
            onViewStudent={handleSelectStudentProfile}
            onOpenUpload={() => setIsUploadOpen(true)}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {currentTab === 'students' && (
          <StudentsView
            currentUser={currentUser}
            onOpenViewer={(m) => setActiveViewerMaterial(m)}
            onSelectStudentProfile={handleSelectStudentProfile}
          />
        )}

        {currentTab === 'faculty' && (
          <FacultyView
            onOpenViewer={(m) => setActiveViewerMaterial(m)}
          />
        )}

        {currentTab === 'profile' && (
          <MyProfileView
            currentUser={currentUser}
            viewProfileUser={inspectingUser}
            onLogout={() => {
              setCurrentUser(null);
              setIsAuthOpen(true);
            }}
            onOpenViewer={(m) => setActiveViewerMaterial(m)}
            onOpenUpload={() => setIsUploadOpen(true)}
            onBackToMyProfile={() => setInspectingUser(null)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-ocean-primary text-white border-t border-ocean-secondary/30 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/peerlib-icon.jpg" alt="PeerLib Icon" className="w-8 h-8 rounded-lg object-contain bg-white/10 p-1" />
            <div>
              <p className="text-sm font-black text-white">Peer<span className="text-ocean-accent">Lib</span></p>
              <p className="text-[11px] text-ocean-support/70">NBKRIST Student Community Knowledge Exchange Platform</p>
            </div>
          </div>
          <div className="text-xs text-ocean-support/80 text-center sm:text-right">
            <p>Designed with Ocean Palette • Deep Slate Navy & Electric Cyan</p>
            <p className="text-[10px] text-ocean-support/50 mt-0.5">Strictly for @nbkrist.org Students & Faculty</p>
          </div>
        </div>
      </footer>

      {/* Upload Material Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentUser={currentUser}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Auth / Registration Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setInspectingUser(null);
          // Add to allUsers if new
          if (!allUsers.find(u => u.id === user.id)) {
            setAllUsers([user, ...allUsers]);
          }
        }}
        allUsers={allUsers}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        material={activeViewerMaterial}
        isOpen={Boolean(activeViewerMaterial)}
        onClose={() => setActiveViewerMaterial(null)}
        currentUser={currentUser}
        onLike={handleLike}
        onCommentAdded={loadUploads}
      />

    </div>
  );
}
