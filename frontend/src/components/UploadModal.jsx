import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Info,
  BookOpen
} from 'lucide-react';
import { CATEGORIES, BRANCH_FULL_NAMES } from '../api';

export default function UploadModal({ isOpen, onClose, currentUser, onUploadSuccess }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lecture Notes');
  const [subject, setSubject] = useState('C Programming');
  const [year, setYear] = useState(currentUser?.year || 1);
  const [branchCode, setBranchCode] = useState(currentUser?.branch_code || '05');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Warning state for Assignment selection
  const [showAssignmentWarning, setShowAssignmentWarning] = useState(false);
  const [confirmedQuestionsOnly, setConfirmedQuestionsOnly] = useState(false);

  if (!isOpen) return null;

  // Handle Category Change with immediate Assignment warning
  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setCategory(selected);
    if (selected === 'Assignment') {
      setShowAssignmentWarning(true);
      setConfirmedQuestionsOnly(false);
    } else {
      setShowAssignmentWarning(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a title for this study material.');
      return;
    }
    if (!subject.trim()) {
      setErrorMsg('Please specify the subject.');
      return;
    }

    if (category === 'Assignment' && currentUser?.role === 'student' && !confirmedQuestionsOnly) {
      setErrorMsg('You must check and confirm that this upload contains questions only.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('user_id', currentUser.id);
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('subject', subject.trim());
      formData.append('year', year);
      formData.append('branch_code', branchCode);
      formData.append('branch_name', BRANCH_FULL_NAMES[branchCode] || 'Engineering');
      formData.append('description', description.trim());
      formData.append('assignment_questions_confirmed', confirmedQuestionsOnly ? 'true' : 'false');

      if (file) {
        formData.append('document', file);
      }

      await onUploadSuccess(formData);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-primary/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-ocean-secondary/30 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-ocean-primary text-white border-b border-ocean-secondary">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-white/10 border border-ocean-accent/40 shadow-ocean-glow">
              <img 
                src="/peerlib-icon.jpg" 
                alt="PeerLib Icon" 
                className="w-7 h-7 rounded-lg object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold">Upload Study Material</h2>
              <p className="text-xs text-ocean-support/80">
                Share notes, records & questions with NBKRIST peers
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-ocean-support/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* CRITICAL: Immediate Warning Banner for Assignment selection */}
          {showAssignmentWarning && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm animate-pulse space-y-2">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-extrabold text-amber-900 uppercase tracking-wide">
                    ⚠️ Academic Integrity Warning: Questions Only!
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    NBKRIST students must upload <strong>Assignment Questions ONLY</strong>. 
                    Posting of assignment answers or solutions is <strong>strictly prohibited</strong>. 
                    Violating materials will be flagged and deleted by faculty, and student reputation points will be deducted.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2.5 pt-2 border-t border-amber-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedQuestionsOnly}
                  onChange={(e) => setConfirmedQuestionsOnly(e.target.checked)}
                  className="w-4 h-4 text-ocean-secondary rounded border-amber-400 focus:ring-ocean-accent"
                />
                <span className="text-xs font-bold text-amber-950">
                  I certify that this document contains only Assignment Questions, not solutions.
                </span>
              </label>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
              Material Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. C Programming Pointers & Memory Management Notes"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ocean-secondary focus:ring-2 focus:ring-ocean-accent/30 text-sm font-medium text-ocean-primary bg-ocean-background/40 transition-all outline-none"
            />
          </div>

          {/* Category & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ocean-secondary focus:ring-2 focus:ring-ocean-accent/30 text-sm font-semibold text-ocean-secondary bg-white transition-all outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. C Programming, DSA, OS"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ocean-secondary focus:ring-2 focus:ring-ocean-accent/30 text-sm font-medium text-ocean-primary bg-ocean-background/40 transition-all outline-none"
              />
            </div>
          </div>

          {/* Year & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
                Target Year (1 to 4) <span className="text-rose-500">*</span>
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ocean-secondary focus:ring-2 focus:ring-ocean-accent/30 text-sm font-semibold text-ocean-primary bg-white transition-all outline-none"
              >
                <option value={1}>1st Year (B.Tech)</option>
                <option value={2}>2nd Year (B.Tech)</option>
                <option value={3}>3rd Year (B.Tech)</option>
                <option value={4}>4th Year (B.Tech)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
                Engineering Branch <span className="text-rose-500">*</span>
              </label>
              <select
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ocean-secondary focus:ring-2 focus:ring-ocean-accent/30 text-sm font-semibold text-ocean-primary bg-white transition-all outline-none"
              >
                {Object.entries(BRANCH_FULL_NAMES).map(([code, name]) => (
                  <option key={code} value={code}>{code}: {name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
              Select Document / PDF
            </label>
            <div className="relative border-2 border-dashed border-ocean-secondary/30 rounded-2xl p-6 text-center hover:border-ocean-secondary bg-ocean-background/30 transition-all cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-10 h-10 text-ocean-secondary mx-auto mb-2" />
              {file ? (
                <div className="text-sm font-bold text-ocean-secondary flex items-center justify-center gap-1.5">
                  <FileText className="w-4 h-4 text-ocean-accent" />
                  <span>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-ocean-primary">
                    Click or drag & drop PDF, Word, or Document file
                  </p>
                  <p className="text-xs text-ocean-muted mt-1">
                    Max size: 25MB • Formats: .pdf, .docx, .txt
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-ocean-primary uppercase tracking-wider mb-1.5">
              Description / Topics Covered (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key topics, chapter names, or reference textbook units..."
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-ocean-secondary focus:ring-2 focus:ring-ocean-accent/30 text-sm font-medium text-ocean-primary bg-ocean-background/40 transition-all outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-ocean-muted hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-ocean-secondary hover:bg-ocean-primary text-white font-bold text-sm shadow-ocean-glow transition-all disabled:opacity-50"
            >
              <img 
                src="/peerlib-icon.jpg" 
                alt="Icon" 
                className="w-4 h-4 rounded-sm object-contain"
              />
              <span>{isSubmitting ? 'Uploading...' : 'Publish Material'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
