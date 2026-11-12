import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  BookOpen, 
  Search, 
  CheckCircle, 
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';
import { fetchFaculty } from '../api';

export default function FacultyView({ onOpenViewer, onFilterByFaculty }) {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadFaculty();
  }, [search]);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      const res = await fetchFaculty({ search });
      if (res.success) {
        setFacultyList(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-ocean-subtle">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-ocean-secondary" />
            <h1 className="text-2xl font-black text-ocean-primary tracking-tight">
              NBKRIST Faculty Mentors & Reviewers
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-ocean-muted mt-1">
            Faculty members verify study materials, provide suggestions, and oversee academic standards.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-ocean-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name or department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-ocean-primary focus:border-ocean-secondary focus:ring-2 focus:ring-ocean-accent/30 bg-ocean-background/40 outline-none"
          />
        </div>
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-ocean-accent border-t-ocean-secondary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-ocean-muted">Loading faculty profiles...</p>
        </div>
      ) : facultyList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Users className="w-12 h-12 text-ocean-muted mx-auto mb-3" />
          <p className="text-base font-bold text-ocean-primary">No faculty members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {facultyList.map(faculty => (
            <div
              key={faculty.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-ocean-subtle hover:shadow-ocean-hover hover:border-ocean-secondary/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Faculty Header */}
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src={faculty.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=PeerLib'}
                    alt={faculty.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-ocean-secondary/50"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-ocean-primary leading-tight">
                      {faculty.name}
                    </h3>
                    <p className="text-xs font-bold text-ocean-secondary flex items-center gap-1 mt-0.5">
                      <Award className="w-3.5 h-3.5 text-ocean-accent" />
                      <span>Faculty Mentor</span>
                    </p>
                    <p className="text-[11px] text-ocean-muted truncate max-w-[200px]">
                      {faculty.email}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {faculty.bio || `Faculty in ${faculty.dealing_branch} at NBKRIST.`}
                </p>

                {/* Academic Coverage Details */}
                <div className="space-y-2 bg-ocean-background/60 p-3.5 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-[11px] font-bold text-ocean-muted uppercase">Branch</span>
                    <span className="font-semibold text-ocean-primary text-right truncate max-w-[160px]">
                      {faculty.dealing_branch}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-[11px] font-bold text-ocean-muted uppercase">Dealing Years</span>
                    <span className="font-semibold text-ocean-secondary">
                      Year {faculty.dealing_year}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-[11px] font-bold text-ocean-muted uppercase">Sections</span>
                    <span className="font-semibold text-ocean-primary">
                      {faculty.sections || 'All Sections'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <p className="text-[10px] text-ocean-muted font-bold uppercase">Official Uploads</p>
                  <p className="text-sm font-extrabold text-ocean-primary mt-0.5">
                    {faculty.uploads_count || 0}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <p className="text-[10px] text-ocean-muted font-bold uppercase">Endorsements</p>
                  <p className="text-sm font-extrabold text-ocean-secondary flex items-center justify-center gap-1 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-ocean-accent" />
                    <span>{faculty.recommendations_count || 0}</span>
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
