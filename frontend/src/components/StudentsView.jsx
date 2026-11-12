import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Star, 
  BookOpen, 
  Award, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { fetchStudents, toggleStarStudent, BRANCH_NAMES, BRANCH_FULL_NAMES } from '../api';

export default function StudentsView({ currentUser, onOpenViewer, onSelectStudentProfile }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    loadStudents();
  }, [selectedBranch, selectedYear, search]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedBranch) params.branch = selectedBranch;
      if (selectedYear) params.year = selectedYear;
      if (search) params.search = search;
      if (currentUser?.id) params.viewer_id = currentUser.id;

      const res = await fetchStudents(params);
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStar = async (studentId, e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("Please sign in to star student profiles.");
      return;
    }
    if (currentUser.id === studentId) {
      alert("You cannot star your own profile.");
      return;
    }

    try {
      const res = await toggleStarStudent(studentId, currentUser.id);
      if (res.success) {
        setStudents(students.map(s => {
          if (s.id === studentId) {
            return {
              ...s,
              is_starred: res.starred,
              stars_count: res.stars_count,
              points: res.points
            };
          }
          return s;
        }));
      }
    } catch (err) {
      alert(err.message || 'Failed to star profile.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-ocean-subtle">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-ocean-secondary" />
            <h1 className="text-2xl font-black text-ocean-primary tracking-tight">
              NBKRIST Student Directory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-ocean-muted mt-1">
            Browse registered peer profiles, discover study contributors, and star top performers.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-ocean-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by roll no or name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-ocean-primary focus:border-ocean-secondary focus:ring-2 focus:ring-ocean-accent/30 bg-ocean-background/40 outline-none"
          />
        </div>
      </div>

      {/* Filter Chips: Year & Branch */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-ocean-subtle space-y-4">
        
        {/* Branch Filter */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-ocean-primary uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-ocean-secondary" />
            <span>Filter by Branch</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBranch('')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedBranch === ''
                  ? 'bg-ocean-secondary text-white shadow-md'
                  : 'bg-ocean-background text-ocean-muted hover:text-ocean-primary hover:bg-ocean-support/50'
              }`}
            >
              All Branches
            </button>
            {Object.entries(BRANCH_NAMES).map(([code, label]) => (
              <button
                key={code}
                onClick={() => setSelectedBranch(code)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedBranch === code
                    ? 'bg-ocean-secondary text-white shadow-md'
                    : 'bg-ocean-background text-ocean-muted hover:text-ocean-primary hover:bg-ocean-support/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Year Filter */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-ocean-primary uppercase tracking-wider">
            <span>Filter by Year</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedYear('')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedYear === ''
                  ? 'bg-ocean-primary text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:text-ocean-primary'
              }`}
            >
              All Years
            </button>
            {[1, 2, 3, 4].map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(String(yr))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedYear === String(yr)
                    ? 'bg-ocean-primary text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:text-ocean-primary'
                }`}
              >
                {yr === 1 ? '1st Year' : yr === 2 ? '2nd Year' : yr === 3 ? '3rd Year' : '4th Year'}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Student Profile Cards Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-ocean-accent border-t-ocean-secondary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-ocean-muted">Loading registered student profiles...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <GraduationCap className="w-12 h-12 text-ocean-muted mx-auto mb-3" />
          <p className="text-base font-bold text-ocean-primary">No student profiles found.</p>
          <p className="text-xs text-ocean-muted mt-1">Try relaxing your search or branch filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map(student => {
            const isSelf = currentUser?.id === student.id;
            return (
              <div
                key={student.id}
                onClick={() => onSelectStudentProfile(student.id)}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-ocean-subtle hover:shadow-ocean-hover hover:border-ocean-secondary/40 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Top Bar with Star & Branch tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-ocean-support text-ocean-secondary border border-ocean-secondary/20">
                      {student.branch_code} • Year {student.year}
                    </span>

                    {/* Star Button */}
                    <button
                      onClick={(e) => handleStar(student.id, e)}
                      disabled={isSelf}
                      title={isSelf ? "You cannot star yourself" : "Star student profile"}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                        student.is_starred
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-50 text-slate-600 hover:text-amber-600 hover:bg-amber-50 border border-slate-200'
                      } ${isSelf ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <Star className={`w-3.5 h-3.5 ${student.is_starred ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{student.stars_count || 0}</span>
                    </button>
                  </div>

                  {/* Student Identity */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={student.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=PeerLib'}
                      alt={student.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-ocean-accent/40 group-hover:scale-105 transition-transform"
                    />
                    <div className="truncate">
                      <h3 className="text-base font-extrabold text-ocean-primary group-hover:text-ocean-secondary transition-colors truncate">
                        {student.name}
                      </h3>
                      <p className="text-xs font-bold text-ocean-secondary">
                        {student.roll_no}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {student.bio || `NBKRIST student studying in ${student.branch_name}.`}
                  </p>
                </div>

                {/* Badges and Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs mb-3">
                    <div className="p-2 rounded-xl bg-ocean-background/80 border border-slate-100">
                      <p className="text-[10px] text-ocean-muted font-bold uppercase">Reputation</p>
                      <p className="text-sm font-extrabold text-ocean-primary flex items-center justify-center gap-1 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{student.points || 0} pts</span>
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-ocean-background/80 border border-slate-100">
                      <p className="text-[10px] text-ocean-muted font-bold uppercase">Materials</p>
                      <p className="text-sm font-extrabold text-ocean-secondary flex items-center justify-center gap-1 mt-0.5">
                        <BookOpen className="w-3.5 h-3.5 text-ocean-secondary" />
                        <span>{student.uploads_count || 0}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-ocean-secondary group-hover:text-ocean-primary transition-colors">
                    <span>View Shared Study Resources</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
