import React from 'react';
import { 
  Star, 
  Trophy, 
  Award, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function BestProfileCard({ 
  profile, 
  currentUser, 
  onStarToggle, 
  onViewStudent, 
  onOpenViewer 
}) {
  if (!profile) return null;

  const isSelf = currentUser?.id === profile.id;

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-ocean-primary via-ocean-primary to-[#051c2d] p-6 sm:p-7 text-white shadow-2xl border-2 border-ocean-accent/40 overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-ocean-accent/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-ocean-secondary/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header Tag */}
      <div className="flex items-center justify-between gap-3 mb-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ocean-accent/20 border border-ocean-accent/50 text-ocean-accent text-xs font-extrabold tracking-wide uppercase shadow-ocean-glow">
          <Trophy className="w-4 h-4 text-ocean-accent" />
          <span>Best Student Profile of the Week</span>
        </div>
        <span className="text-xs text-ocean-support/70 font-semibold hidden sm:inline">
          Leaderboard Spotlight
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Profile Info (Col 7) */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={profile.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                alt={profile.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-ocean-accent/60 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 bg-ocean-accent text-ocean-primary p-1.5 rounded-xl font-black text-xs shadow-md">
                ⭐ #{1}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {profile.name}
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-ocean-accent">
                {profile.roll_no} • Year {profile.year}
              </p>
              <p className="text-xs text-ocean-support/80 truncate max-w-sm mt-0.5">
                {profile.branch_name}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-ocean-support/90 leading-relaxed max-w-lg">
            {profile.bio || "Active academic contributor sharing verified notes and assignment question banks with fellow NBKRIST engineers."}
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-[10px] text-ocean-support/70 uppercase font-bold tracking-wider">Stars Earned</p>
              <p className="text-lg sm:text-xl font-extrabold text-ocean-accent flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-4 h-4 fill-ocean-accent text-ocean-accent" />
                {profile.stars_count || 0}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-[10px] text-ocean-support/70 uppercase font-bold tracking-wider">Peer Points</p>
              <p className="text-lg sm:text-xl font-extrabold text-white flex items-center justify-center gap-1 mt-0.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                {profile.points || 0}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-[10px] text-ocean-support/70 uppercase font-bold tracking-wider">Materials Shared</p>
              <p className="text-lg sm:text-xl font-extrabold text-white flex items-center justify-center gap-1 mt-0.5">
                <BookOpen className="w-4 h-4 text-ocean-support" />
                {profile.topUploads?.length || 4}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onStarToggle(profile.id)}
              disabled={isSelf}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                profile.is_starred
                  ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                  : 'bg-ocean-accent hover:bg-ocean-support text-ocean-primary hover:scale-[1.02]'
              } ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Star className={`w-4 h-4 ${profile.is_starred ? 'fill-amber-950' : 'fill-ocean-primary'}`} />
              <span>{profile.is_starred ? 'Profile Starred' : 'Star This Profile (+5 pts)'}</span>
            </button>

            <button
              onClick={() => onViewStudent(profile.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-ocean-support border border-white/15 transition-all"
            >
              <span>View Full Student Profile</span>
              <ArrowRight className="w-4 h-4 text-ocean-accent" />
            </button>
          </div>
        </div>

        {/* Top Uploads by this Student (Col 5) */}
        <div className="md:col-span-5 bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
          <p className="text-xs font-bold text-ocean-accent uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>Top Study Contributions</span>
          </p>

          <div className="space-y-2">
            {profile.topUploads && profile.topUploads.length > 0 ? (
              profile.topUploads.map(up => (
                <div
                  key={up.id}
                  onClick={() => onOpenViewer(up)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="truncate">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-ocean-secondary/60 text-ocean-support mr-1.5">
                      {up.category}
                    </span>
                    <p className="text-xs font-bold text-white group-hover:text-ocean-accent truncate mt-1">
                      {up.title}
                    </p>
                    <p className="text-[10px] text-ocean-support/60 truncate">
                      {up.subject} • {up.likes_count} likes
                    </p>
                  </div>
                  <FileText className="w-4 h-4 text-ocean-accent shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))
            ) : (
              <p className="text-xs text-ocean-support/60 italic py-4 text-center">
                High-yield uploads in progress.
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
