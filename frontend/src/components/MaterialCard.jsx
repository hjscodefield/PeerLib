import React, { useState } from 'react';
import { 
  Heart, 
  Download, 
  MessageSquare, 
  Award, 
  AlertTriangle, 
  Clock, 
  Trash2, 
  Flag, 
  CheckCircle,
  Eye,
  Lock,
  User,
  Sparkles
} from 'lucide-react';

export default function MaterialCard({ 
  material, 
  currentUser, 
  onLike, 
  onOpenViewer, 
  onRecommend, 
  onFlag 
}) {
  const [showModerationMenu, setShowModerationMenu] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagPrompt, setShowFlagPrompt] = useState(false);
  const [flagMode, setFlagMode] = useState('flag'); // 'flag' or 'flag_delete'

  const isStudent = currentUser?.role === 'student';
  const isFaculty = currentUser?.role === 'faculty';
  const isFlagged = Boolean(material.is_flagged);
  const isRecommended = Boolean(material.is_faculty_recommended);
  const isAuthorFaculty = material.user_role === 'faculty';

  // Can faculty flag this upload? Only student uploads can be flagged!
  const canFacultyFlag = isFaculty && !isAuthorFaculty;

  // Format time remaining for flagged uploads (48 hours auto-delete countdown)
  const getFlagCountdown = () => {
    if (!material.auto_delete_at) return '2 days';
    const diffMs = new Date(material.auto_delete_at) - new Date();
    if (diffMs <= 0) return 'Pending auto-deletion';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return days > 0 ? `${days}d ${remHours}h remaining` : `${remHours}h remaining`;
  };

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    if (isFlagged) {
      alert("⚠️ Download Disabled! This material has been flagged by faculty and cannot be downloaded by anyone.");
      return;
    }
    window.open(`/api/uploads/${material.id}/download`, '_blank');
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    onLike(material.id);
  };

  const handleConfirmFlagAction = () => {
    if (!flagReason.trim()) {
      alert("Please provide a moderation reason.");
      return;
    }
    onFlag(material.id, flagReason.trim(), flagMode);
    setShowFlagPrompt(false);
    setShowModerationMenu(false);
  };

  return (
    <div className={`relative rounded-3xl bg-white border transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-ocean-subtle hover:shadow-ocean-hover ${
      isFlagged 
        ? 'border-amber-300 bg-amber-50/20' 
        : isRecommended 
        ? 'border-ocean-accent/60 ring-1 ring-ocean-accent/30' 
        : 'border-slate-200/80 hover:border-ocean-secondary/50'
    }`}>
      
      {/* Top Banner for Flagged or Recommended */}
      {isFlagged ? (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1.5 truncate">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Flagged by {material.flagged_by_faculty_name || 'Faculty'}</span>
          </div>
          <span className="flex items-center gap-1 shrink-0 text-[11px] bg-amber-600/80 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            {getFlagCountdown()}
          </span>
        </div>
      ) : isRecommended ? (
        <div className="bg-gradient-to-r from-ocean-secondary to-ocean-primary text-ocean-support px-4 py-1.5 flex items-center justify-between text-xs font-bold border-b border-ocean-accent/30">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-ocean-accent" />
            <span className="text-white">Faculty Recommended</span>
          </div>
          <span className="text-[10px] text-ocean-accent font-semibold">
            by {material.recommended_by_faculty_name}
          </span>
        </div>
      ) : null}

      {/* Main Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Tag chips */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-ocean-support text-ocean-secondary border border-ocean-secondary/20">
              {material.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {material.subject}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-ocean-muted bg-ocean-background">
              Yr {material.year} • {material.branch_code}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onOpenViewer(material)}
            className="text-base sm:text-lg font-extrabold text-ocean-primary group-hover:text-ocean-secondary transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {material.title}
          </h3>

          {/* Description / Content Preview */}
          {material.access_blocked ? (
            <div className="my-3 p-3 rounded-xl bg-amber-100/60 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{material.block_message || "Material locked: Flagged for faculty review."}</span>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {material.description || `Study notes for ${material.subject} at NBKRIST.`}
            </p>
          )}
        </div>

        {/* Author Details & File Info */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-ocean-support flex items-center justify-center text-ocean-secondary font-bold text-xs">
              {material.user_name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-ocean-primary flex items-center gap-1">
                {material.user_name}
                {isAuthorFaculty && (
                  <span className="text-[10px] bg-ocean-primary text-ocean-accent px-1 rounded font-semibold">Faculty</span>
                )}
              </p>
              <p className="text-[10px] text-ocean-muted truncate max-w-[120px]">
                {material.file_size || 'PDF'}
              </p>
            </div>
          </div>

          {/* Like Counter & Heart */}
          <button
            onClick={handleLikeClick}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              material.is_liked
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'text-slate-500 hover:text-rose-600 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${material.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{material.likes_count || 0}</span>
          </button>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3 bg-ocean-background/60 border-t border-slate-100 flex items-center justify-between gap-2">
        
        {/* View / Discuss Button */}
        <button
          onClick={() => onOpenViewer(material)}
          disabled={material.access_blocked}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-ocean-secondary text-ocean-primary hover:text-ocean-secondary text-xs font-bold transition-all disabled:opacity-40"
        >
          <Eye className="w-3.5 h-3.5 text-ocean-secondary" />
          <span>{material.access_blocked ? 'Restricted' : 'Preview'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Download Button */}
          <button
            onClick={handleDownloadClick}
            disabled={isFlagged}
            title={isFlagged ? "Download disabled because this material is flagged" : "Download PDF"}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isFlagged
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : 'bg-ocean-secondary hover:bg-ocean-primary text-white shadow-sm'
            }`}
          >
            {isFlagged ? (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Blocked</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-ocean-accent" />
                <span>Get Doc</span>
              </>
            )}
          </button>

          {/* Faculty Moderation Options Dropdown */}
          {isFaculty && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModerationMenu(!showModerationMenu);
                }}
                className="p-1.5 rounded-xl bg-white hover:bg-ocean-support/60 border border-slate-200 text-ocean-primary transition-colors text-xs font-bold"
                title="Faculty Moderation Actions"
              >
                ⚙️
              </button>

              {showModerationMenu && (
                <div 
                  className="absolute right-0 bottom-full mb-2 w-56 bg-ocean-primary border border-ocean-secondary rounded-2xl shadow-xl py-2 z-30 text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1 text-[10px] font-extrabold text-ocean-accent uppercase tracking-wider border-b border-white/10">
                    Faculty Moderation
                  </div>

                  {/* Recommend button */}
                  {!isRecommended && (
                    <button
                      onClick={() => {
                        onRecommend(material.id);
                        setShowModerationMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-ocean-support hover:bg-ocean-secondary hover:text-white transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-ocean-accent" />
                      <span>Recommend (+25 pts)</span>
                    </button>
                  )}

                  {/* Flag Options: Only allowed on student uploads */}
                  {canFacultyFlag ? (
                    <>
                      <button
                        onClick={() => {
                          setFlagMode('flag');
                          setShowFlagPrompt(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-600/20 transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Flag (2-day auto delete)</span>
                      </button>

                      <button
                        onClick={() => {
                          setFlagMode('flag_delete');
                          setShowFlagPrompt(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-600/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Flag & Delete (-20 pts)</span>
                      </button>
                    </>
                  ) : (
                    <div className="px-3 py-2 text-[11px] text-ocean-support/60 italic">
                      Faculty uploads cannot be flagged.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Flag Reason Modal / Prompt */}
      {showFlagPrompt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-primary/80 backdrop-blur-sm"
          onClick={() => setShowFlagPrompt(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-base font-extrabold text-ocean-primary">
                {flagMode === 'flag_delete' ? 'Flag & Delete Material' : 'Flag Material for Review'}
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {flagMode === 'flag_delete'
                ? 'This action will immediately delete the material and deduct 20 reputation points from the student profile for policy violation (e.g. posting assignment answers).'
                : 'This will lock the material from being downloaded or viewed by students. It will be displayed as flagged by you and automatically deleted after 2 days.'}
            </p>

            <div>
              <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1">
                Moderation Reason
              </label>
              <textarea
                rows={3}
                required
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="e.g. Contains forbidden assignment answers / Inappropriate content..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-ocean-primary bg-ocean-background outline-none focus:border-ocean-secondary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFlagPrompt(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmFlagAction}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md ${
                  flagMode === 'flag_delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Confirm {flagMode === 'flag_delete' ? 'Delete & Penalize' : 'Flag Material'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
