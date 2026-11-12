import React, { useState, useEffect } from 'react';
import { 
  X, 
  GraduationCap, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { decodeRollEmail, registerStudent, registerFaculty, BRANCH_NAMES, BRANCH_FULL_NAMES } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, allUsers = [] }) {
  const [tab, setTab] = useState('student'); // 'student' or 'faculty'
  
  // Student registration states
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentYear, setStudentYear] = useState('1');
  const [decodedData, setDecodedData] = useState(null);
  const [studentError, setStudentError] = useState('');

  // Faculty registration states
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [facultyBranch, setFacultyBranch] = useState('COMPUTER SCIENCE AND ENGINEERING (CSE)');
  const [facultyYears, setFacultyYears] = useState('2, 3');
  const [facultySections, setFacultySections] = useState('CSE-A, CSE-B');
  const [facultyError, setFacultyError] = useState('');

  const [loading, setLoading] = useState(false);

  // Automatically decode student email as they type
  useEffect(() => {
    if (studentEmail && studentEmail.includes('@')) {
      handleDecodeEmail(studentEmail);
    } else {
      setDecodedData(null);
      setStudentError('');
    }
  }, [studentEmail]);

  const handleDecodeEmail = async (email) => {
    try {
      const res = await decodeRollEmail(email);
      if (res.success) {
        setDecodedData(res);
        setStudentError('');
      } else {
        setDecodedData(null);
        setStudentError(res.message);
      }
    } catch (err) {
      setDecodedData(null);
    }
  };

  if (!isOpen) return null;

  // Handle Google OAuth simulation with nbkrist.org
  const handleGoogleSignInStudent = () => {
    const sampleRoll = '24kb1a05ty';
    const sampleEmail = `${sampleRoll}@nbkrist.org`;
    setStudentEmail(sampleEmail);
    setStudentName('Teja Yadav');
    setStudentYear('1');
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setStudentError('');

    if (!decodedData || !decodedData.valid) {
      setStudentError('Only @nbkrist.org email domain is permitted for student registration.');
      return;
    }
    if (!studentName.trim()) {
      setStudentError('Please enter your full student name.');
      return;
    }

    try {
      setLoading(true);
      const res = await registerStudent({
        email: studentEmail.trim().toLowerCase(),
        name: studentName.trim(),
        year: Number(studentYear)
      });
      if (res.success) {
        onAuthSuccess(res.user);
        onClose();
      } else {
        setStudentError(res.message);
      }
    } catch (err) {
      setStudentError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    setFacultyError('');

    if (!facultyEmail || !facultyEmail.includes('@')) {
      setFacultyError('Please enter a valid email address.');
      return;
    }
    if (!facultyName.trim()) {
      setFacultyError('Please enter your full name and title.');
      return;
    }

    try {
      setLoading(true);
      const res = await registerFaculty({
        email: facultyEmail.trim().toLowerCase(),
        name: facultyName.trim(),
        dealing_branch: facultyBranch,
        dealing_year: facultyYears,
        sections: facultySections
      });
      if (res.success) {
        onAuthSuccess(res.user);
        onClose();
      } else {
        setFacultyError(res.message);
      }
    } catch (err) {
      setFacultyError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-primary/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-ocean-secondary/30 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-ocean-primary text-white border-b border-ocean-secondary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-white/10 border border-ocean-accent/40 shadow-ocean-glow">
              <img src="/peerlib-icon.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">PeerLib NBKRIST Portal</h2>
              <p className="text-xs text-ocean-support/80">Account Registration & Role Selection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-ocean-support/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection: Student vs Faculty */}
        <div className="flex border-b border-slate-200 bg-ocean-background/50">
          <button
            onClick={() => setTab('student')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              tab === 'student'
                ? 'border-ocean-secondary text-ocean-secondary bg-white shadow-sm'
                : 'border-transparent text-ocean-muted hover:text-ocean-primary'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Registration (@nbkrist.org)</span>
          </button>

          <button
            onClick={() => setTab('faculty')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              tab === 'faculty'
                ? 'border-ocean-secondary text-ocean-secondary bg-white shadow-sm'
                : 'border-transparent text-ocean-muted hover:text-ocean-primary'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Faculty Registration (Any Email)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {tab === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              
              {/* Google Sign-In Quick Fill Button */}
              <button
                type="button"
                onClick={handleGoogleSignInStudent}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-2xl border-2 border-slate-200 hover:border-ocean-secondary bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm transition-all shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with NBKRIST Google Account</span>
              </button>

              <div className="flex items-center gap-3 text-slate-400 text-xs">
                <div className="flex-1 border-t border-slate-200" />
                <span className="uppercase font-semibold">Or enter email manually</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {studentError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{studentError}</span>
                </div>
              )}

              {/* Student NBKRIST Email */}
              <div>
                <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
                  NBKRIST Student Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="e.g. 24kb1a05ty@nbkrist.org"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-ocean-primary bg-ocean-background/40 focus:border-ocean-secondary focus:ring-2 focus:ring-ocean-accent/30 outline-none"
                />
                <p className="text-[11px] text-ocean-muted mt-1">
                  Must be strictly from <strong className="text-ocean-secondary">@nbkrist.org</strong> domain.
                </p>
              </div>

              {/* Auto-extracted Roll No & Branch Card */}
              {decodedData && (
                <div className="p-4 rounded-2xl bg-ocean-support/60 border border-ocean-secondary/30 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-ocean-secondary font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-ocean-secondary" />
                    <span>Auto-Detected Credentials</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-ocean-muted">Auto-Fetched Roll No:</span>
                      <p className="font-extrabold text-ocean-primary text-sm">{decodedData.rollNo}</p>
                    </div>
                    <div>
                      <span className="text-ocean-muted">Branch (Code {decodedData.branchCode}):</span>
                      <p className="font-extrabold text-ocean-secondary text-xs">{decodedData.branchName}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-ocean-muted italic pt-1 border-t border-ocean-secondary/20">
                    * Branch code decoded from the 3rd and 4th digits from right of roll number.
                  </p>
                </div>
              )}

              {/* Manual Name Typing */}
              <div>
                <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
                  Full Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Teja Yadav"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-ocean-primary bg-ocean-background/40 focus:border-ocean-secondary focus:ring-2 focus:ring-ocean-accent/30 outline-none"
                />
              </div>

              {/* Year Selection (1 to 4) */}
              <div>
                <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
                  Current Year (1 to 4) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((yr) => (
                    <button
                      type="button"
                      key={yr}
                      onClick={() => setStudentYear(String(yr))}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        studentYear === String(yr)
                          ? 'bg-ocean-secondary text-white border-ocean-secondary shadow-md'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-ocean-secondary/50'
                      }`}
                    >
                      Year {yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !decodedData}
                className="w-full py-3 rounded-2xl bg-ocean-secondary hover:bg-ocean-primary text-white font-bold text-sm shadow-ocean-glow transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Registering...' : 'Complete Student Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleFacultySubmit} className="space-y-4">
              
              {facultyError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{facultyError}</span>
                </div>
              )}

              {/* Faculty Email */}
              <div>
                <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
                  Faculty Email (Any Domain) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={facultyEmail}
                  onChange={(e) => setFacultyEmail(e.target.value)}
                  placeholder="e.g. ksrinivas@nbkrist.org or prof.srinivas@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-ocean-primary bg-ocean-background/40 focus:border-ocean-secondary outline-none"
                />
              </div>

              {/* Faculty Full Name */}
              <div>
                <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
                  Faculty Full Name & Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="e.g. Dr. K. Srinivas"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-ocean-primary bg-ocean-background/40 focus:border-ocean-secondary outline-none"
                />
              </div>

              {/* Dealing Branch */}
              <div>
                <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
                  Dealing Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  value={facultyBranch}
                  onChange={(e) => setFacultyBranch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-ocean-primary bg-white focus:border-ocean-secondary outline-none"
                >
                  {Object.values(BRANCH_FULL_NAMES).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Dealing Year & Sections */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
                    Dealing Year(s)
                  </label>
                  <input
                    type="text"
                    value={facultyYears}
                    onChange={(e) => setFacultyYears(e.target.value)}
                    placeholder="e.g. 2, 3"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-ocean-primary bg-ocean-background/40 focus:border-ocean-secondary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
                    Dealing Section(s)
                  </label>
                  <input
                    type="text"
                    value={facultySections}
                    onChange={(e) => setFacultySections(e.target.value)}
                    placeholder="e.g. CSE-A, CSE-B"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-ocean-primary bg-ocean-background/40 focus:border-ocean-secondary outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-ocean-secondary hover:bg-ocean-primary text-white font-bold text-sm shadow-ocean-glow transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Registering...' : 'Register Faculty Profile'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Accounts Switcher Bar */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-ocean-muted uppercase tracking-wider mb-2">
              Or instantly test with a pre-configured account:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {allUsers.slice(0, 4).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    onAuthSuccess(u);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-ocean-support/60 border border-slate-200 text-left transition-colors flex items-center gap-2"
                >
                  <img src={u.avatar_url} alt="" className="w-6 h-6 rounded-md object-cover" />
                  <div className="truncate">
                    <p className="font-bold text-ocean-primary truncate">{u.name}</p>
                    <p className="text-[10px] text-ocean-muted capitalize">{u.role} ({u.branch_code || 'Faculty'})</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
