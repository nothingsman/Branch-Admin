
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  UserPlus, 
  FileUp, 
  Filter, 
  ChevronDown, 
  X, 
  Link as LinkIcon, 
  MoreVertical,
  Mail,
  Phone,
  AlertCircle,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  User,
  Trash2,
  Check,
  ShieldCheck,
  FileText,
  Calendar,
  Link2Off
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Parent, Student } from '../types';

const mockStudents: Student[] = [
  { id: 'S1', name: 'Nahom Teshome', grade: 'Grade 10', section: 'A', registrationStatus: 'Registered', languagePreference: 'English', parentId: 'P1' },
  { id: 'S2', name: 'Abebe Bikila', grade: 'Grade 9', section: 'B', registrationStatus: 'Registered', languagePreference: 'Amharic' },
  { id: 'S3', name: 'Sara Lemma', grade: 'Grade 10', section: 'C', registrationStatus: 'Pending', languagePreference: 'English' },
  { id: 'S4', name: 'Hanna Kebede', grade: 'Grade 8', section: 'A', registrationStatus: 'Registered', languagePreference: 'Amharic', parentId: 'P2' },
  { id: 'S5', name: 'Yonas Mulugeta', grade: 'Grade 11', section: 'D', registrationStatus: 'Withdrawn', languagePreference: 'English' },
  { id: 'S6', name: 'Marta Desalegn', grade: 'Grade 9', section: 'A', registrationStatus: 'Registered', languagePreference: 'Amharic' },
];

const mockParents: Parent[] = [
  { 
    id: 'P1', 
    name: 'Teshome G. Michael', 
    phone: '+251 911 223344', 
    email: 'teshome.gm@example.com', 
    status: 'Active', 
    linkedStudents: ['S1'], 
    languagePreference: 'English',
    relationship: 'Father',
    isPrimaryContact: true
  },
  { 
    id: 'P2', 
    name: 'Kebede Ayele', 
    phone: '+251 911 556677', 
    email: 'k.ayele@school.edu', 
    status: 'Invited', 
    linkedStudents: ['S4'], 
    languagePreference: 'Amharic',
    relationship: 'Father',
    isPrimaryContact: true
  },
  { 
    id: 'P3', 
    name: 'Almaz Tadesse', 
    phone: '+251 922 889900', 
    email: 'almaz.t@mail.com', 
    status: 'Pending Linkage', 
    linkedStudents: [], 
    languagePreference: 'Amharic',
    isPrimaryContact: false
  },
];

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const ParentAvatar = ({ photoUrl, name, size = 'sm' }: { photoUrl?: string; name: string; size?: 'sm' | 'md' | 'lg' }) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);

  const containerSizes = {
    sm: "w-10 h-10 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-20 h-20 text-xl"
  };

  return (
    <div className={`${containerSizes[size]} rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0`}>
      {photoUrl && !imageError ? (
        <img 
          src={photoUrl} 
          alt={name} 
          className="w-full h-full object-cover" 
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="font-bold text-slate-400">{initials}</span>
      )}
    </div>
  );
};

const ParentProfileAvatar = ({ photoUrl, name }: { photoUrl?: string; name: string }) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);

  return (
    <div className="w-12 h-12 md:w-20 md:h-20 text-sm md:text-xl rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
      {photoUrl && !imageError ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="font-bold text-slate-400">{initials}</span>
      )}
    </div>
  );
};

export const Parents: React.FC<{ academicYear: string }> = ({ academicYear }) => {
  const [parents, setParents] = useState<Parent[]>(mockParents);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [activeTab, setActiveTab] = useState<'all' | 'unlinked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  
  const selectedParent = useMemo(() => 
    parents.find(p => p.id === selectedParentId) || null,
  [parents, selectedParentId]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudentForLink, setSelectedStudentForLink] = useState<Student | null>(null);

  // Filter states
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [langFilter, setLangFilter] = useState('All Languages');

  const filteredParents = useMemo(() => {
    return parents.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery);
      // Further filtering logic if needed
      return matchesSearch;
    });
  }, [parents, searchQuery]);

  const unlinkedStudents = useMemo(() => {
    return students.filter(s => !s.parentId);
  }, [students]);

  const newParentsCount = parents.filter(p => p.status === 'Pending Linkage').length;

  const handleLinkStudent = (studentId: string, parentId: string) => {
    // Update students state
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, parentId } : s
    ));

    // Update parents state
    setParents(prev => prev.map(p => {
      if (p.id === parentId) {
        return {
          ...p,
          linkedStudents: Array.from(new Set([...p.linkedStudents, studentId])),
          status: p.status === 'Pending Linkage' ? 'Active' : p.status
        };
      }
      return p;
    }));
  };

  const handleUnlinkStudent = (studentId: string, parentId: string) => {
    // Update students state
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, parentId: undefined } : s
    ));

    // Update parents state
    setParents(prev => prev.map(p => {
      if (p.id === parentId) {
        const remainingStudents = p.linkedStudents.filter(id => id !== studentId);
        return {
          ...p,
          linkedStudents: remainingStudents,
          status: remainingStudents.length === 0 ? 'Pending Linkage' : p.status
        };
      }
      return p;
    }));
  };

  const handleUpdateParent = (updatedParent: Parent) => {
    setParents(prev => prev.map(p => p.id === updatedParent.id ? updatedParent : p));
  };

  const handleBulkInvite = () => {
    // Logic for bulk invite would go here
    setShowBulkInviteModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Dynamic Header & Search */}
      <div className="bg-white px-4 md:px-6 py-4 md:py-6 border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex items-center justify-between">
            <div className="hidden sm:flex items-center gap-3">
               <div className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-xl shadow-md">
                Academic year {academicYear}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button 
                onClick={() => setShowImportModal(true)}
                className="p-2.5 sm:px-4 sm:py-2.5 bg-accent/10 text-primary rounded-xl border border-accent/20 font-bold text-sm flex items-center gap-2 hover:bg-accent/20 transition-all active:scale-95 shadow-sm"
              >
                <FileUp className="w-4 h-4" /> <span className="hidden sm:inline">Bulk Import</span>
              </button>
              {newParentsCount > 0 && (
                <button 
                  onClick={() => setShowBulkInviteModal(true)}
                  className="p-2.5 sm:px-4 sm:py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
                >
                  <Mail className="w-4 h-4" /> <span className="hidden sm:inline">Bulk Invite ({newParentsCount})</span>
                  <span className="sm:hidden">{newParentsCount}</span>
                </button>
              )}
              <button 
                onClick={() => setShowInviteModal(true)}
                className="bg-primary hover:bg-primary/90 text-white p-2.5 sm:px-5 sm:py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Invite Parent</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Search parents..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterDropdown 
                label={gradeFilter} 
                options={['All Grades', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11']} 
                onSelect={setGradeFilter} 
              />
            </div>
          </div>

          {/* Custom Tabs */}
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                activeTab === 'all' 
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/10' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-primary/40 hover:text-primary shadow-sm'
              }`}
            >
              All Parents
            </button>
            <button 
              onClick={() => setActiveTab('unlinked')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 flex items-center gap-2 ${
                activeTab === 'unlinked' 
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/10' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-primary/40 hover:text-primary shadow-sm'
              }`}
            >
              Unlinked Students
              {unlinkedStudents.length > 0 && (
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] transition-colors ${
                  activeTab === 'unlinked' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-600'
                }`}>
                  {unlinkedStudents.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'all' ? (
            <motion.div 
              key="all-parents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">
                <span>Directory ({filteredParents.length} Parents)</span>
              </div>

              {filteredParents.map((parent) => (
                <ParentCard 
                  key={parent.id} 
                  parent={parent} 
                  students={students.filter(s => parent.linkedStudents.includes(s.id))}
                  onClick={() => setSelectedParentId(parent.id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="unlinked-students"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>{unlinkedStudents.length} Students Needing Engagement</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlinkedStudents.map(student => (
                  <UnlinkedStudentCard 
                    key={student.id} 
                    student={student} 
                    onLink={() => setSelectedStudentForLink(student)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {selectedParent && (
          <ParentDetailView 
            parent={selectedParent} 
            onClose={() => setSelectedParentId(null)} 
            students={students.filter(s => selectedParent.linkedStudents.includes(s.id))}
            allStudents={students}
            onLink={handleLinkStudent}
            onUnlink={handleUnlinkStudent}
            onUpdate={handleUpdateParent}
            academicYear={academicYear}
          />
        )}
        {selectedStudentForLink && (
          <LinkParentToStudentModal 
            student={selectedStudentForLink}
            onClose={() => setSelectedStudentForLink(null)}
            allParents={parents}
            onLink={(parentId) => {
              handleLinkStudent(selectedStudentForLink.id, parentId);
              setSelectedStudentForLink(null);
            }}
          />
        )}
        {showInviteModal && (
          <InviteParentModal 
            onClose={() => setShowInviteModal(false)}
            allStudents={students}
          />
        )}
        {showBulkInviteModal && (
          <BulkInviteModal 
            count={newParentsCount}
            onClose={() => setShowBulkInviteModal(false)}
            onConfirm={handleBulkInvite}
          />
        )}
        {showImportModal && (
          <ParentImportModal 
            onClose={() => setShowImportModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ParentImportModal = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState<'upload' | 'processing' | 'success'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    setStep('processing');
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setStep('success');
      }
    }, 50);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <FileUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Bulk Import Parents</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Map Parents to Students via CSV</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(); }}
                  className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
                    dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-slate-200 hover:border-primary/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                    <FileUp className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Drop your file here</h4>
                  <p className="text-sm text-slate-500 mb-6">Support for CSV, XLS, XLSX formats</p>
                  <button 
                    onClick={handleUpload}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:border-primary/40 hover:text-primary transition-all shadow-sm"
                  >
                    Select File
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-xs font-medium text-slate-600">Ensure your CSV includes columns for <span className="font-bold">Parent Name</span>, <span className="font-bold">Phone</span>, and <span className="font-bold">Student ID</span>.</p>
                  </div>
                  <button className="text-xs font-bold text-primary hover:underline ml-11">Download CSV Template</button>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center space-y-6"
              >
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-slate-100 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                    <motion.circle
                      className="text-primary stroke-current"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                      style={{
                        strokeDasharray: `${2 * Math.PI * 40}`,
                        strokeDashoffset: `${2 * Math.PI * 40 * (1 - progress / 100)}`,
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%'
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-black text-primary">{progress}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Validating Data</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Checking for duplicates and invalid Student IDs...</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">Import Complete!</h3>
                  <p className="text-sm text-slate-500">
                    Successfully mapped <span className="font-bold text-emerald-600">42 parents</span> to their respective students.
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={onClose}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all"
                  >
                    View Directory
                  </button>
                  <button className="text-xs font-bold text-slate-400 hover:text-slate-600">Review Import Log</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface BulkInviteModalProps {
  count: number;
  onClose: () => void;
  onConfirm: () => void;
}

const BulkInviteModal: React.FC<BulkInviteModalProps> = ({ count, onClose, onConfirm }) => {
  const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
  const [progress, setProgress] = useState(0);

  const startInvitation = () => {
    setStep('processing');
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setStep('success');
      }
    }, 100);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6 text-center"
      >
        {step === 'confirm' && (
          <>
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Send Bulk Invitations</h3>
              <p className="text-sm text-slate-500">
                You are about to send portal invitations to <span className="font-bold text-slate-900">{count} new parents</span>. Each will receive instructions to link their children.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Review
              </button>
              <button 
                onClick={startInvitation}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Send Now
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="space-y-6 py-4">
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-slate-100 stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-primary stroke-current transition-all duration-300"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 40}`,
                    strokeDashoffset: `${2 * Math.PI * 40 * (1 - progress / 100)}`,
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-black text-primary">{progress}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Processing Emails</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sending Invites...</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">All Invites Sent!</h3>
              <p className="text-sm text-slate-500">
                All parents have been notified and moved to <span className="font-bold text-primary">Invited</span> status.
              </p>
            </div>
            <button 
              onClick={onConfirm}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all mt-4"
            >
              Back to Directory
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

interface ParentCardProps {
  parent: Parent;
  students: Student[];
  onClick: () => void;
}

const ParentCard: React.FC<ParentCardProps> = ({ parent, students, onClick }) => {
  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ y: -2 }}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1">
          <ParentAvatar photoUrl={parent.photoUrl} name={parent.name} />
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">{parent.name}</h3>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
                <Phone className="w-3.5 h-3.5" />
                {parent.phone}
              </span>
              <StatusBadge status={parent.status} />
            </div>
          </div>
        </div>

        {students.length > 0 && (
          <div className="md:border-l md:pl-6 border-slate-100 flex flex-col gap-2 min-w-[240px]">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Linked Student(s)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {students.map(s => (
                <div key={s.id} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{s.name} <span className="text-[10px] font-medium text-slate-400">({s.grade})</span></span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button className="hidden lg:block p-2 text-slate-300 hover:text-slate-600 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

interface UnlinkedStudentCardProps {
  student: Student;
  onLink?: () => void;
}

const UnlinkedStudentCard: React.FC<UnlinkedStudentCardProps> = ({ student, onLink }) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
          <User className="w-6 h-6 text-slate-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">{student.name}</h4>
          <p className="text-xs text-slate-500 font-medium">{student.grade} • Section {student.section}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 text-right">
        <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Needs Engagement
        </span>
        <button 
          onClick={onLink}
          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 group"
        >
          Link Parent <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const FilterDropdown = ({ label, options, onSelect }: { label: string; options: string[]; onSelect: (o: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3.5 bg-slate-50 text-slate-600 rounded-2xl border border-transparent hover:bg-white hover:border-slate-200 transition-all active:scale-95 flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline-block truncate max-w-[100px]">{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden"
            >
              {options.map(o => (
                <button 
                  key={o}
                  onClick={() => { onSelect(o); setIsOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                >
                  {o}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusBadge = ({ status }: { status: Parent['status'] }) => {
  const styles = {
    'Active': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Invited': 'bg-blue-50 text-blue-600 border-blue-100',
    'Pending Linkage': 'bg-amber-50 text-amber-600 border-amber-100'
  };
  return (
    <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

const ParentDetailView = ({ parent, onClose, students, allStudents, onLink, onUnlink, onUpdate, academicYear }: { parent: Parent; onClose: () => void; students: Student[]; allStudents: Student[]; onLink: (studentId: string, parentId: string) => void; onUnlink: (studentId: string, parentId: string) => void; onUpdate: (p: Parent) => void; academicYear: string }) => {
  const [langPref, setLangPref] = useState<'English' | 'Amharic'>('English');
  const [showReports, setShowReports] = useState(false);
  const [showLinkStudent, setShowLinkStudent] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-end">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:block px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg shadow-sm">
                {academicYear}
              </div>
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-3 md:px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] md:text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={() => setShowLinkStudent(true)}
                className="px-3 md:px-4 py-2 bg-primary text-white rounded-xl text-[10px] md:text-xs font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Link Student
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <ParentProfileAvatar photoUrl={parent.photoUrl} name={parent.name} />
            <div className="space-y-0.5 md:space-y-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 truncate">{parent.name}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-slate-500">
                <span className="flex items-center gap-1.5 text-[10px] md:text-sm font-bold">
                  <Phone className="w-3 md:w-4 h-3 md:h-4 text-primary" /> {parent.phone}
                </span>
                <span className="hidden sm:block text-slate-300">•</span>
                <span className="flex items-center gap-1.5 text-[10px] md:text-sm font-bold truncate">
                  <Mail className="w-3 md:w-4 h-3 md:h-4 text-primary" /> {parent.email}
                </span>
              </div>
              <div className="pt-1.5 md:pt-2">
                <StatusBadge status={parent.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs/Sections */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-6">
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Column: Quick Actions & Settings */}
            <div className="w-full md:w-64 lg:w-72 md:border-r border-slate-100 p-4 md:p-6 space-y-6 md:space-y-8 bg-slate-50/30">
               <section className="space-y-3 md:space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</h3>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-slate-700">{parent.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-slate-700 truncate">{parent.email}</span>
                    </div>
                  </div>
               </section>
            </div>

            {/* Right Column: Dynamic Content */}
            <div className="flex-1 p-4 md:p-6 space-y-8 md:space-y-10">
              {/* Linked Children Gallery */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Children</h3>
                  <span className="text-[10px] font-bold text-primary">{students.length} Total</span>
                </div>
                <div className="flex flex-col gap-3">
                  {students.map(student => (
                    <motion.div 
                      key={student.id}
                      whileHover={{ x: 4 }}
                      className="p-3 md:p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 md:gap-4 transition-all hover:border-primary/20 hover:bg-white shadow-sm"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                        <User className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs md:text-sm font-bold text-slate-900 truncate">{langPref === 'English' ? student.name : 'ተማሪው ስም'}</h4>
                        <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">{student.grade} • {student.section} • ID: {student.id}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnlink(student.id, parent.id);
                        }}
                        className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors group/btn relative shrink-0"
                        title="Unlink Student"
                      >
                        <Link2Off className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs md:text-sm hover:bg-white/80 transition-colors shadow-sm">
               <ShieldCheck className="w-4 h-4" /> <span className="hidden sm:inline">Manage Security</span> <span className="sm:hidden">Security</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold text-xs md:text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all">
              Save Changes
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showReports && (
            <ReportHistoryModal 
              parentName={parent.name}
              onClose={() => setShowReports(false)}
            />
          )}
          {showLinkStudent && (
            <LinkStudentModal 
              parentName={parent.name}
              onClose={() => setShowLinkStudent(false)}
              allStudents={allStudents}
              onLink={(studentId) => {
                onLink(studentId, parent.id);
                setShowLinkStudent(false);
              }}
            />
          )}
          {showEditModal && (
            <EditParentModal 
              parent={parent}
              onClose={() => setShowEditModal(false)}
              onSave={(updated) => {
                onUpdate(updated);
                setShowEditModal(false);
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const InviteParentModal = ({ onClose, allStudents }: { onClose: () => void; allStudents: Student[] }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    searchStudent: '',
    selectedStudents: [] as Student[],
    relationship: 'Father',
    isPrimary: true
  });

  const searchedStudent = useMemo(() => {
    if (!formData.searchStudent || formData.searchStudent.length < 2) return null;
    return allStudents.find(s => 
      s.name.toLowerCase().includes(formData.searchStudent.toLowerCase()) || 
      s.id.toLowerCase().includes(formData.searchStudent.toLowerCase())
    );
  }, [formData.searchStudent, allStudents]);

  const addStudent = (student: Student) => {
    if (!formData.selectedStudents.find(s => s.id === student.id)) {
      setFormData({
        ...formData,
        selectedStudents: [...formData.selectedStudents, student],
        searchStudent: ''
      });
    }
  };

  const removeStudent = (id: string) => {
    setFormData({
      ...formData,
      selectedStudents: formData.selectedStudents.filter(s => s.id !== id)
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-primary/20 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Invite & Link Parent</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Step {step} of 2 • {step === 1 ? 'Personal Info' : 'Student Mapping'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <InputField 
                    label="Parent Full Name" 
                    placeholder="Enter full legal name" 
                    value={formData.name} 
                    onChange={v => setFormData({...formData, name: v})} 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField 
                      label="Email Address" 
                      placeholder="parent@example.com" 
                      type="email" 
                      value={formData.email} 
                      onChange={v => setFormData({...formData, email: v})} 
                    />
                    <InputField 
                      label="Phone Number" 
                      placeholder="+251 9XX XXX XXX" 
                      value={formData.phone} 
                      onChange={v => setFormData({...formData, phone: v})} 
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-slate-50">
                     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-slate-900">Primary Contact</p>
                          <p className="text-[10px] text-slate-500 font-medium">Determines recipient of urgent SMS/App alerts</p>
                        </div>
                        <button 
                          onClick={() => setFormData({...formData, isPrimary: !formData.isPrimary})}
                          className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${formData.isPrimary ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                          <motion.div 
                            animate={{ x: formData.isPrimary ? 26 : 2 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </button>
                     </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Student by Name or ID</label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary" />
                      <input 
                        type="text"
                        placeholder="Type student name or employee ID..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-medium text-sm"
                        value={formData.searchStudent}
                        onChange={(e) => setFormData({...formData, searchStudent: e.target.value})}
                      />
                    </div>

                    {searchedStudent && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-4"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 relative overflow-hidden">
                                {searchedStudent.photoUrl ? (
                                  <img src={searchedStudent.photoUrl} className="w-full h-full object-cover" />
                                ) : <User className="w-6 h-6 text-slate-400" />}
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-slate-900">{searchedStudent.name}</h4>
                                <p className="text-xs text-slate-500 font-bold uppercase">{searchedStudent.id} • {searchedStudent.grade}</p>
                            </div>
                            <button 
                              onClick={() => addStudent(searchedStudent)}
                              className="ml-auto p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                         </div>
                         <div className="p-3 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4 shrink-0" />
                           Admin Identity Verification: Verify student photo and grade before linking.
                         </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Linked Students</span>
                      <button className="text-[10px] font-bold text-primary hover:underline">Clear All</button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 no-scrollbar">
                      {formData.selectedStudents.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-300">
                           <LinkIcon className="w-8 h-8 opacity-20" />
                           <span className="text-[10px] font-bold uppercase">No Students Linked Yet</span>
                        </div>
                      ) : (
                        formData.selectedStudents.map(s => (
                          <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100">
                                <User className="w-4 h-4 text-slate-400" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-slate-900">{s.name}</h5>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">{s.grade}</p>
                              </div>
                            </div>
                            <button onClick={() => removeStudent(s.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg group-hover:opacity-100 transition-all opacity-0">
                               <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relationship</label>
                      <select 
                        value={formData.relationship}
                        onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 font-bold text-xs text-slate-700"
                      >
                        <option>Father</option>
                        <option>Mother</option>
                        <option>Guardian</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 mt-auto">
          {step === 1 ? (
             <button 
              onClick={() => setStep(2)}
              disabled={!formData.name || !formData.phone}
              className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
                !formData.name || !formData.phone 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-primary text-white shadow-primary/20 active:scale-[0.98]'
              }`}
            >
              Continue to Student Linking <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-colors shadow-sm"
              >
                Back
              </button>
              <button 
                onClick={onClose}
                disabled={formData.selectedStudents.length === 0}
                className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
                  formData.selectedStudents.length === 0 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-primary text-white shadow-primary/20 active:scale-[0.98]'
                }`}
              >
                Complete Invitation & Link <Check className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const ReportHistoryModal = ({ parentName, onClose }: { parentName: string; onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Report History</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Engagement logs for {parentName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {[
            { 
              id: 'R1', 
              title: 'Academic Performance Risk Alert', 
              date: 'Oct 24, 2024', 
              status: 'Resolved', 
              details: 'Subject: Mathematics - Grade drop identified. Parent acknowledged receipt and requested a meeting.',
              students: ['Nahom Teshome']
            },
            { 
              id: 'R2', 
              title: 'Attendance Discrepancy Notification', 
              date: 'Oct 12, 2024', 
              status: 'Closed', 
              details: 'System-generated alert for consecutive absences. Verified as medical leave by parent.',
              students: ['Nahom Teshome']
            },
            { 
              id: 'R3', 
              title: 'Quarterly Progress Report Access', 
              date: 'Sep 30, 2024', 
              status: 'Delivered', 
              details: 'Parent accessed the Q1 Progress Report via the portal link.',
              students: ['Nahom Teshome']
            },
            { 
              id: 'R4', 
              title: 'General School Announcement', 
              date: 'Sep 15, 2024', 
              status: 'Sent', 
              details: 'Notice regarding the upcoming Parent-Teacher Conference.',
              students: ['Nahom Teshome']
            }
          ].map(report => (
            <ParentReportCard key={report.id} report={report} />
          ))}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
           <button 
             onClick={onClose}
             className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
           >
             Close Report View
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface ParentReportCardProps {
  report: any;
}

const ParentReportCard: React.FC<ParentReportCardProps> = ({ report }) => {
  return (
    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-primary/20 transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black text-primary uppercase tracking-wider">{report.title}</span>
             <span className="w-1 h-1 rounded-full bg-slate-200" />
             <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <Calendar className="w-3 h-3" />
                {report.date}
             </div>
          </div>
          <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{report.title}</p>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">{report.details}</p>
          
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
               <User className="w-3 h-3 text-slate-400" />
               <span className="text-[10px] font-bold text-slate-600">{report.students.join(', ')}</span>
            </div>
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
              report.status === 'Resolved' || report.status === 'Closed' 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-blue-50 text-blue-600'
            }`}>
              {report.status}
            </span>
          </div>
        </div>
        <button className="p-2 text-slate-300 hover:text-primary transition-colors">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const LinkParentToStudentModal = ({ student, onClose, allParents, onLink }: { student: Student; onClose: () => void; allParents: Parent[]; onLink: (parentId: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);

  const searchedParent = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return null;
    return allParents.find(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.phone.includes(searchQuery)
    );
  }, [searchQuery, allParents]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Link Parent to Student</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Assign a parent to {student.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200">
               <User className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</p>
              <h4 className="text-sm font-bold text-slate-900">{student.name} ({student.grade})</h4>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Find Parent</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Search by parent name or phone..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-white transition-all text-sm font-medium text-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="min-h-[120px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl p-6">
            {searchedParent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm"
              >
                <ParentAvatar name={searchedParent.name} />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">{searchedParent.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{searchedParent.phone}</p>
                </div>
                <button 
                  onClick={() => setSelectedParent(searchedParent)}
                  className={`p-2 rounded-xl transition-all ${
                    selectedParent?.id === searchedParent.id 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </motion.div>
            ) : (
              <div className="text-center space-y-2">
                <Search className="w-6 h-6 text-slate-200 mx-auto" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search for an existing parent</p>
                <button className="text-xs font-bold text-primary hover:underline">+ Or Invite New Parent</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relationship</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700">
                  <option>Father</option>
                  <option>Mother</option>
                  <option>Guardian</option>
                </select>
             </div>
             <div className="flex items-center gap-3 pt-5">
                <button 
                  onClick={onClose}
                  className="w-full h-[42px] bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={!selectedParent}
                  onClick={() => selectedParent && onLink(selectedParent.id)}
                  className={`w-full h-[42px] rounded-xl text-xs font-bold transition-all shadow-lg ${
                    !selectedParent 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-primary text-white shadow-primary/20 active:scale-95'
                  }`}
                >
                  Link Now
                </button>
             </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const LinkStudentModal = ({ parentName, onClose, allStudents, onLink }: { parentName: string; onClose: () => void; allStudents: Student[]; onLink: (studentId: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const searchedStudent = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return null;
    return allStudents.find(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allStudents]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Link New Student</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Select a student to link to {parentName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Student</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Search by name or registration ID..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-white transition-all text-sm font-medium text-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="min-h-[120px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl p-6">
            {searchedStudent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm"
              >
                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                  <User className="w-7 h-7 text-slate-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-slate-900">{searchedStudent.name}</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase">{searchedStudent.id} • {searchedStudent.grade}</p>
                </div>
                <button 
                  onClick={() => setSelectedStudent(searchedStudent)}
                  className={`p-2 rounded-xl transition-all ${
                    selectedStudent?.id === searchedStudent.id 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : 'bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="w-6 h-6" />
                </button>
              </motion.div>
            ) : (
              <div className="text-center space-y-2">
                <Search className="w-8 h-8 text-slate-200 mx-auto" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start typing to find a student</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relationship</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700">
                  <option>Father</option>
                  <option>Mother</option>
                  <option>Guardian</option>
                </select>
             </div>
             <div className="flex items-center gap-3 pt-5">
                <button className="w-full h-[42px] bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button 
                  disabled={!selectedStudent}
                  onClick={() => selectedStudent && onLink(selectedStudent.id)}
                  className={`w-full h-[42px] rounded-xl text-xs font-bold transition-all shadow-lg ${
                    !selectedStudent 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-primary text-white shadow-primary/20 active:scale-95'
                  }`}
                >
                  Confirm Link
                </button>
             </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const EditParentModal = ({ parent, onClose, onSave }: { parent: Parent; onClose: () => void; onSave: (p: Parent) => void }) => {
  const [formData, setFormData] = useState({
    name: parent.name,
    phone: parent.phone,
    email: parent.email
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Edit Parent Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <InputField 
            label="Full Name" 
            placeholder="Parent name" 
            value={formData.name} 
            onChange={(v) => setFormData({ ...formData, name: v })} 
          />
          <InputField 
            label="Phone Number" 
            placeholder="+251..." 
            value={formData.phone} 
            onChange={(v) => setFormData({ ...formData, phone: v })} 
          />
          <InputField 
            label="Email Address" 
            placeholder="Email" 
            value={formData.email} 
            onChange={(v) => setFormData({ ...formData, email: v })} 
          />
        </div>

        <div className="p-6 bg-slate-50 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all"
          >
            Discard
          </button>
          <button 
            onClick={() => onSave({ ...parent, ...formData })}
            className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const InputField = ({ label, placeholder, value, onChange, type = 'text' }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} 
      placeholder={placeholder} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-white transition-all text-sm font-medium text-slate-700" 
    />
  </div>
);
