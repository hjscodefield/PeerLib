import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Heart, 
  MessageSquare, 
  Send, 
  AlertTriangle, 
  Sparkles, 
  Lock, 
  FileText, 
  User, 
  Award 
} from 'lucide-react';
import { fetchUploadById, addComment } from '../api';

export default function DocumentViewerModal({ 
  material, 
  isOpen, 
  onClose, 
  currentUser, 
  onLike,
  onCommentAdded 
}) {
  const [activeMaterial, setActiveMaterial] = useState(material);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (material && isOpen) {
      loadDetails();
    }
  }, [material, isOpen]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const res = await fetchUploadById(material.id, currentUser?.role, currentUser?.id);
      if (res.success) {
        setActiveMaterial(res.data);
        setComments(res.data.comments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !activeMaterial) return null;

  const isStudent = currentUser?.role === 'student';
  const isFaculty = currentUser?.role === 'faculty';
  const isFlagged = Boolean(activeMaterial.is_flagged);

  // If flagged and user is student, viewing is blocked!
  if (isFlagged && isStudent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-primary/80 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-amber-300 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-ocean-primary">Access Restricted</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            This study material was flagged by{' '}
            <strong className="text-ocean-primary">{activeMaterial.flagged_by_faculty_name || 'Faculty'}</strong>{' '}
            and cannot be viewed or downloaded by students. It is currently under moderation review and scheduled for auto-deletion in 2 days.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-ocean-secondary hover:bg-ocean-primary text-white text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const res = await addComment(activeMaterial.id, currentUser.id, commentText.trim());
      if (res.success) {
        setComments([...comments, res.data]);
        setCommentText('');
        if (onCommentAdded) onCommentAdded();
      }
    } catch (err) {
      alert(err.message || 'Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDownload = () => {
    if (isFlagged) {
      alert("Download disabled! This upload has been flagged and cannot be downloaded by anyone.");
      return;
    }
    window.open(`/api/uploads/${activeMaterial.id}/download`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-primary/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-2 border-ocean-secondary/30 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-ocean-primary text-white border-b border-ocean-secondary">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-white/10 border border-ocean-accent/40 shadow-ocean-glow">
              <img 
                src="/peerlib-icon.jpg" 
                alt="PeerLib Icon" 
                className="w-6 h-6 rounded-md object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ocean-support text-ocean-secondary">
                  {activeMaterial.category}
                </span>
                <span className="text-xs text-ocean-support/80">
                  {activeMaterial.subject} • Year {activeMaterial.year}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-xl">
                {activeMaterial.title}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-ocean-support/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Flag Alert if viewing as faculty */}
        {isFlagged && (
          <div className="bg-amber-500 text-white px-6 py-2.5 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Faculty Review Mode: Flagged by {activeMaterial.flagged_by_faculty_name}. Download is disabled for all users.
              </span>
            </div>
            <span className="text-[11px] bg-amber-600 px-2 py-0.5 rounded-full">
              Reason: {activeMaterial.flagged_reason || 'Policy Check'}
            </span>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          
          {/* Document Content / Preview (Col 7) */}
          <div className="lg:col-span-7 p-6 space-y-5">
            
            {/* Faculty Verified Badge */}
            {activeMaterial.is_faculty_recommended && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-ocean-support/60 to-ocean-background border border-ocean-accent/40 flex items-center gap-3">
                <Award className="w-6 h-6 text-ocean-secondary shrink-0" />
                <div>
                  <p className="text-xs font-bold text-ocean-primary">Faculty Verified & Recommended</p>
                  <p className="text-[11px] text-ocean-secondary">
                    Recommended by {activeMaterial.recommended_by_faculty_name} for outstanding academic quality.
                  </p>
                </div>
              </div>
            )}

            {/* Description & Metadata */}
            <div>
              <h4 className="text-xs font-extrabold text-ocean-primary uppercase tracking-wider mb-2">
                Document Overview
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-ocean-background/40 p-4 rounded-2xl border border-slate-100">
                {activeMaterial.description || 'No detailed description provided for this study document.'}
              </p>
            </div>

            {/* Simulated Document Viewer Canvas */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
              <div className="w-14 h-14 rounded-2xl bg-ocean-support flex items-center justify-center text-ocean-secondary shadow-sm">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-ocean-primary">{activeMaterial.file_name}</p>
                <p className="text-xs text-ocean-muted mt-0.5">
                  Size: {activeMaterial.file_size || '2.4 MB'} • {activeMaterial.branch_name}
                </p>
              </div>

              {/* Action Bar */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onLike(activeMaterial.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeMaterial.is_liked
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-white border border-slate-200 text-slate-700 hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${activeMaterial.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{activeMaterial.likes_count || 0} Likes</span>
                </button>

                <button
                  onClick={handleDownload}
                  disabled={isFlagged}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    isFlagged
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-ocean-secondary hover:bg-ocean-primary text-white shadow-ocean-glow'
                  }`}
                >
                  {isFlagged ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Download Disabled</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-ocean-accent" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Author Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ocean-support text-ocean-secondary flex items-center justify-center font-bold text-sm">
                  {activeMaterial.user_name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-ocean-primary">{activeMaterial.user_name}</p>
                  <p className="text-[11px] text-ocean-muted capitalize">
                    {activeMaterial.user_role} • Year {activeMaterial.year} • {activeMaterial.branch_code}
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-ocean-muted font-medium">
                {new Date(activeMaterial.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Discussion & Faculty Feedback Thread (Col 5) */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-ocean-background/20 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-extrabold text-ocean-primary uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-ocean-secondary" />
                  <span>Peer & Faculty Discussion ({comments.length})</span>
                </h4>
              </div>

              {/* Comments List */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-ocean-muted italic text-center py-8">
                    No comments yet. Be the first to give feedback or ask questions!
                  </p>
                ) : (
                  comments.map(c => {
                    const isCommentFaculty = c.user_role === 'faculty';
                    return (
                      <div 
                        key={c.id} 
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isCommentFaculty 
                            ? 'bg-ocean-support/40 border-ocean-secondary/30' 
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-ocean-primary flex items-center gap-1.5">
                            {c.user_name}
                            {isCommentFaculty && (
                              <span className="text-[10px] bg-ocean-secondary text-white px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                                <Award className="w-2.5 h-2.5 text-ocean-accent" /> Faculty Suggestion
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-ocean-muted">
                            {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {c.comment_text}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="pt-3 border-t border-slate-200/80">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    currentUser?.role === 'faculty'
                      ? "Write faculty suggestion or advice..."
                      : "Add a comment or thank the author..."
                  }
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-ocean-primary bg-white outline-none focus:border-ocean-secondary focus:ring-1 focus:ring-ocean-accent"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="px-3 py-2 rounded-xl bg-ocean-secondary hover:bg-ocean-primary text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
}
