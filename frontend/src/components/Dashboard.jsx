import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Award, 
  Search, 
  Filter, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import BestProfileCard from './BestProfileCard';
import MaterialCard from './MaterialCard';
import { CATEGORIES, BRANCH_NAMES } from '../api';

export default function Dashboard({ 
  dashboardData, 
  uploads = [], 
  currentUser, 
  onLike, 
  onOpenViewer, 
  onRecommend, 
  onFlag, 
  onStarToggle, 
  onViewStudent, 
  onOpenUpload,
  selectedCategory,
  setSelectedCategory,
  selectedBranch,
  setSelectedBranch,
  searchQuery,
  setSearchQuery
}) {
  const bestProfile = dashboardData?.best_profile;
  const stats = dashboardData?.stats;
  const trendingUploads = dashboardData?.trending || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-ocean-primary via-ocean-primary to-ocean-secondary text-white p-6 sm:p-10 shadow-2xl overflow-hidden border border-ocean-accent/30">
        
        {/* Glow decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-ocean-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-ocean-secondary/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-ocean-accent/40 text-ocean-accent text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official NBKRIST Peer Knowledge Hub</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Share Study Materials. <br className="hidden sm:inline" />
            <span className="text-ocean-accent">Empower Every NBKRIST Student.</span>
          </h1>

          <p className="text-xs sm:text-base text-ocean-support/90 leading-relaxed max-w-2xl">
            Access verified lecture notes, laboratory records, assignment questions, and reference guides curated by students and verified by faculty mentors.
          </p>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <p className="text-xl sm:text-2xl font-black text-ocean-accent">{stats?.total_materials || 12}</p>
              <p className="text-[11px] text-ocean-support font-semibold">Study Materials</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <p className="text-xl sm:text-2xl font-black text-white">{stats?.total_students || 8}</p>
              <p className="text-[11px] text-ocean-support font-semibold">Active Students</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <p className="text-xl sm:text-2xl font-black text-ocean-accent">{stats?.total_faculty || 3}</p>
              <p className="text-[11px] text-ocean-support font-semibold">Faculty Reviewers</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <p className="text-xl sm:text-2xl font-black text-white">{stats?.faculty_recommended_materials || 4}</p>
              <p className="text-[11px] text-ocean-support font-semibold">Faculty Verified</p>
            </div>
          </div>
        </div>

        {/* Floating Upload CTA */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-ocean-support/80">
            Have handwritten notes or solved lab records to share?
          </p>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ocean-accent hover:bg-ocean-support text-ocean-primary font-black text-xs sm:text-sm shadow-ocean-glow transition-all hover:scale-105"
          >
            <img src="/peerlib-icon.jpg" alt="Icon" className="w-4 h-4 rounded-sm object-contain" />
            <span>Upload Document Now</span>
          </button>
        </div>

      </div>

      {/* Best Profile of the Week Spotlight */}
      {bestProfile && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-ocean-primary tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-ocean-secondary" />
              <span>Spotlight of the Week</span>
            </h2>
          </div>
          <BestProfileCard
            profile={bestProfile}
            currentUser={currentUser}
            onStarToggle={onStarToggle}
            onViewStudent={onViewStudent}
            onOpenViewer={onOpenViewer}
          />
        </section>
      )}

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-ocean-subtle space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-ocean-secondary" />
            <h2 className="text-lg font-black text-ocean-primary tracking-tight">
              Trending Study Materials Now
            </h2>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-ocean-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search materials by title or subject..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-ocean-primary focus:border-ocean-secondary focus:ring-2 focus:ring-ocean-accent/30 bg-ocean-background/40 outline-none"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-ocean-muted uppercase mr-1">Category:</span>
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === ''
                ? 'bg-ocean-secondary text-white shadow-sm'
                : 'bg-ocean-background text-ocean-muted hover:text-ocean-primary'
            }`}
          >
            All Types
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-ocean-secondary text-white shadow-sm'
                  : 'bg-ocean-background text-ocean-muted hover:text-ocean-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Branch Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-ocean-muted uppercase mr-1">Branch:</span>
          <button
            onClick={() => setSelectedBranch('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedBranch === ''
                ? 'bg-ocean-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-ocean-primary'
            }`}
          >
            All Branches
          </button>
          {Object.entries(BRANCH_NAMES).map(([code, label]) => (
            <button
              key={code}
              onClick={() => setSelectedBranch(code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedBranch === code
                  ? 'bg-ocean-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-ocean-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

      </div>

      {/* Materials Grid */}
      <div>
        {uploads.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <BookOpen className="w-12 h-12 text-ocean-muted mx-auto mb-3" />
            <h3 className="text-base font-bold text-ocean-primary">No materials found</h3>
            <p className="text-xs text-ocean-muted mt-1">Try resetting your category or branch filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploads.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                currentUser={currentUser}
                onLike={onLike}
                onOpenViewer={onOpenViewer}
                onRecommend={onRecommend}
                onFlag={onFlag}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
