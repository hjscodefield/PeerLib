import React, { useState, useEffect } from 'react';
import { 
  UserCircle, 
  Star, 
  Sparkles, 
  Award, 
  BookOpen, 
  LogOut, 
  FileText, 
  Heart, 
  Download, 
  Lock, 
  Clock,
  Trash2,
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { fetchUploads, toggleStarStudent } from '../api';

export default function MyProfileView({ 
  currentUser, 
  viewProfileUser = null, 
  onLogout, 
  onOpenViewer, 
  onOpenUpload,
  onBackToMyProfile 
}) {
  const profile = viewProfileUser || currentUser;
  const isViewingSelf = !viewProfileUser || viewProfileUser.id === currentUser?.id;
  const isStudent = profile?.role === 'student';

  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStars, setCurrentStars] = useState(profile?.stars_count || 0);
  const [currentPoints, setCurrentPoints] = useState(profile?.points || 0);
  const [isStarred, setIsStarred] = useState(profile?.is_starred || false);

  useEffect(() => {
    if (profile?.id) {
      loadProfileUploads();
    }
  }, [profile?.id]);

  const loadProfileUploads = async () => {
    try {
      setLoading(true);
      const res = await fetchUploads({
        user_id: profile.id,
        viewer_role: currentUser?.role,
        viewer_id: currentUser?.id
      });
      if (res.success) {
        setUploads(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStarProfile = async () => {
    if (isViewingSelf) return;
    try {
      const res = await toggleStarStudent(profile.id, currentUser.id);
      if (res.success) {
        setIsStarred(res.starred);
        setCurrentStars(res.stars_count);
        setCurrentPoints(res.points);
      }
    } catch (err) {
      alert(err.message || 'Failed to star profile.');
    }
  };

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <UserCircle className="w-12 h-12 text-ocean-muted mx-auto mb-3" />
        <h3 className="text-base font-bold text-ocean-primary">No Profile Selected</h3>
        <p className="text-xs text-ocean-muted mt-1">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Return to My Profile Banner if inspecting another student */}
      {!isViewingSelf && (
        <div className="bg-ocean-support/60 border border-ocean-secondary/30 p-4 rounded-2xl flex items-center justify-between">
          <p className="text-xs font-bold text-ocean-secondary">
            Viewing public profile of <strong className="text-ocean-primary">{profile.name}</strong>
          </p>
          <button
            onClick={onBackToMyProfile}
            className="text-xs font-bold text-ocean-primary underline hover:text-ocean-secondary"
          >
            ← Back to My Account
          </button>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-ocean-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={profile.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=PeerLib'}
                alt={profile.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-ocean-secondary/30 shadow-lg"
              />
              <span className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase shadow-md ${
                isStudent ? 'bg-ocean-accent text-ocean-primary' : 'bg-ocean-primary text-ocean-accent'
              }`}>
                {profile.role}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-ocean-primary tracking-tight">
                  {profile.name}
                </h1>
              </div>

              {isStudent ? (
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs font-extrabold text-ocean-secondary px-2.5 py-0.5 rounded-lg bg-ocean-support/70">
                    Roll: {profile.roll_no}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Year {profile.year} • {profile.branch_code}
                  </span>
                </div>
              ) : (
                <p className="text-xs sm:text-sm font-semibold text-ocean-secondary mt-1">
                  Faculty • {profile.dealing_branch} (Yr {profile.dealing_year})
                </p>
              )}

              <p className="text-xs text-ocean-muted mt-2 max-w-xl leading-relaxed">
                {profile.bio || "NBKRIST community member actively participating in knowledge exchange."}
              </p>
            </div>
          </div>

          {/* Action Area: Star or Logout */}
          <div className="flex flex-wrap items-center gap-3">
            {!isViewingSelf && isStudent && (
              <button
                onClick={handleStarProfile}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-md ${
                  isStarred
                    ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                    : 'bg-ocean-accent hover:bg-ocean-support text-ocean-primary'
                }`}
              >
                <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-950' : 'fill-ocean-primary'}`} />
                <span>{isStarred ? 'Profile Starred' : 'Star Profile (+5 pts)'}</span>
              </button>
            )}

            {isViewingSelf && (
              <>
                <button
                  onClick={onOpenUpload}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-ocean-secondary hover:bg-ocean-primary text-white text-xs font-bold shadow-ocean-glow transition-all"
                >
                  <img src="/peerlib-icon.jpg" alt="Icon" className="w-4 h-4 rounded-sm" />
                  <span>Upload Study Material</span>
                </button>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Reputation Score & Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          
          <div className="p-4 rounded-2xl bg-ocean-background/80 border border-slate-200/60 text-center">
            <p className="text-[10px] text-ocean-muted font-bold uppercase tracking-wider">
              {isStudent ? 'Community Stars' : 'Recommendations'}
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-ocean-secondary flex items-center justify-center gap-1.5 mt-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>{isStudent ? currentStars : profile.recommendations_count || 0}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-ocean-background/80 border border-slate-200/60 text-center">
            <p className="text-[10px] text-ocean-muted font-bold uppercase tracking-wider">
              {isStudent ? 'Reputation Points' : 'Faculty Role'}
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-ocean-primary flex items-center justify-center gap-1.5 mt-1">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span>{isStudent ? `${currentPoints} pts` : 'Mentor'}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-ocean-background/80 border border-slate-200/60 text-center">
            <p className="text-[10px] text-ocean-muted font-bold uppercase tracking-wider">Materials Shared</p>
            <p className="text-xl sm:text-2xl font-extrabold text-ocean-primary flex items-center justify-center gap-1.5 mt-1">
              <BookOpen className="w-5 h-5 text-ocean-secondary" />
              <span>{uploads.length}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-ocean-background/80 border border-slate-200/60 text-center">
            <p className="text-[10px] text-ocean-muted font-bold uppercase tracking-wider">Department</p>
            <p className="text-sm sm:text-base font-extrabold text-ocean-secondary truncate mt-1">
              {profile.branch_code || profile.dealing_branch || 'Engineering'}
            </p>
          </div>

        </div>

        {/* Scoring Guide for Students */}
        {isStudent && (
          <div className="mt-6 p-4 rounded-2xl bg-ocean-support/30 border border-ocean-secondary/20 flex flex-wrap items-center justify-between text-[11px] font-semibold text-ocean-secondary gap-2">
            <span className="font-bold text-ocean-primary">🏆 PeerLib Reputation Matrix:</span>
            <span>+10 pts Material Upload</span>
            <span>•</span>
            <span>+2 pts per Like</span>
            <span>•</span>
            <span>+5 pts per Star</span>
            <span>•</span>
            <span>+25 pts Faculty Recommendation</span>
            <span>•</span>
            <span className="text-rose-600">-20 pts Penalty if Flagged & Deleted</span>
          </div>
        )}

      </div>

      {/* Materials List Shared by this User */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-ocean-primary tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-ocean-secondary" />
            <span>Shared Study Materials ({uploads.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-ocean-accent border-t-ocean-secondary rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-ocean-muted">Fetching materials...</p>
          </div>
        ) : uploads.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-2">
            <FileText className="w-10 h-10 text-ocean-muted mx-auto" />
            <p className="text-sm font-bold text-ocean-primary">No uploads published yet.</p>
            {isViewingSelf && (
              <button
                onClick={onOpenUpload}
                className="mt-2 text-xs font-bold text-ocean-secondary underline"
              >
                Upload your first lecture notes or question bank
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploads.map(item => (
              <div
                key={item.id}
                onClick={() => onOpenViewer(item)}
                className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                  item.is_flagged ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-ocean-support text-ocean-secondary">
                      {item.category}
                    </span>
                    {item.is_faculty_recommended ? (
                      <span className="text-[10px] font-bold text-ocean-secondary flex items-center gap-1 bg-ocean-accent/20 px-2 py-0.5 rounded-full">
                        <Award className="w-3 h-3 text-ocean-secondary" /> Verified
                      </span>
                    ) : null}
                  </div>

                  <h3 className="text-sm font-extrabold text-ocean-primary line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-ocean-muted mt-1">
                    {item.subject} • Year {item.year} • {item.file_name}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-bold text-slate-500">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{item.likes_count || 0}</span>
                  </span>

                  {item.is_flagged ? (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Flagged (2d deletion)
                    </span>
                  ) : (
                    <span className="text-ocean-secondary font-bold text-xs">
                      View Document →
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
