
import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  MoreVertical,
  Mail,
  Calendar,
  ChevronDown,
  X,
  Phone,
  BookOpen,
  Users,
  Bell,
  Megaphone,
  Edit2,
  UserCheck,
  UserX,
  Globe,
  ArrowLeft,
  FilePlus,
  FileText,
  UserPlus,
  User,
  Trash2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Teacher } from '../types';

const isInvitedTeacher = (teacher: Teacher) => teacher.status === 'Invited';

const getTeacherStatusClasses = (status: Teacher['status']) => {
  if (status === 'Active') return 'bg-green-50 text-green-700 border border-green-100';
  if (status === 'Invited') return 'bg-amber-50 text-amber-700 border border-amber-100';
  if (status === 'On Leave') return 'bg-blue-50 text-blue-700 border border-blue-100';
  return 'bg-slate-50 text-slate-500 border border-slate-100';
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const demoTeachers: Teacher[] = [
  { 
    id: '1', 
    name: 'Abebe Kebede', 
    employeeId: 'T-2024-001', 
    email: 'abebe.k@school.edu', 
    phone: '+251 911 223 344',
    status: 'Active', 
    subjects: ['Mathematics'], 
    assignedSections: ['9B', '10A'],
    bioEn: 'Dedicated mathematics teacher with 10 years of experience in secondary education. Specialist in advanced calculus and statistics.',
    bioAm: 'Abebe Kebede yematematiquis memhir sihon be hulatenga dereja timhirt bet liyu tiyoqin ena statistiquin yamashit naw.',
    totalAlerts: 124,
    parentAnnouncements: 15,
    joiningDate: '2022-09-01',
    photoUrl: 'https://images.unsplash.com/photo-1544717297-fa154daaf761?w=120&h=120&fit=crop'
  },
  { 
    id: '2', 
    name: 'Sara Tesfaye', 
    employeeId: 'T-2024-002', 
    email: 'sara.t@school.edu', 
    phone: '+251 922 445 566',
    status: 'Invited', 
    subjects: ['Science'], 
    assignedSections: ['8C', '7A'],
    bioEn: 'Passionate science educator focusing on interactive laboratory learning and environmental stewardship.',
    bioAm: 'Sara Tesfaye be sayins timhirt liyu tiyoqin ena be akababi tebiqa lay yamashit nat.',
    totalAlerts: 0,
    parentAnnouncements: 2,
    joiningDate: '2024-01-15',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop'
  },
  { 
    id: '3', 
    name: 'Samuel Desta', 
    employeeId: 'T-2024-003', 
    email: 'samuel.d@school.edu', 
    phone: '+251 933 667 788',
    status: 'Active', 
    subjects: ['History'], 
    assignedSections: ['11B', '12A'],
    bioEn: 'Expert in modern African history and political science. Committed to fostering critical thinking in students.',
    bioAm: 'Samuel Desta be amiru African tarik ena be poletika sayins lay yamashit naw.',
    totalAlerts: 89,
    parentAnnouncements: 8,
    joiningDate: '2021-08-20',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop'
  },
  { 
    id: '4', 
    name: 'Tigist Belay', 
    employeeId: 'T-2024-004', 
    email: 'tigist.b@school.edu', 
    phone: '+251 944 889 900',
    status: 'Invited', 
    subjects: ['English'], 
    assignedSections: ['9A', '10C'],
    bioEn: 'Language specialist with a focus on literature and creative writing.',
    bioAm: 'Tigist Belay bequanqua ena besine-tihuf lay yamashit nat.',
    totalAlerts: 0,
    parentAnnouncements: 0,
    joiningDate: '2024-05-10',
    photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop'
  },
  { 
    id: '5', 
    name: 'Dawit Mekonnen', 
    employeeId: 'T-2024-005', 
    email: 'dawit.m@school.edu', 
    phone: '+251 955 001 122',
    status: 'Invited', 
    subjects: ['Arts'], 
    assignedSections: ['7B', '8A'],
    bioEn: 'Visual artist and educator dedicated to nurturing creativity.',
    bioAm: 'Dawit Mekonnen besine-tihibeb ena befeterawi sira lay yamashit naw.',
    totalAlerts: 0,
    parentAnnouncements: 0,
    joiningDate: '2024-05-12',
    photoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=120&h=120&fit=crop'
  },
];

const TeacherAvatar = ({ photoUrl, name, size = 'sm' }: { photoUrl?: string; name: string; size?: 'sm' | 'lg' }) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);

  const containerClasses = size === 'lg' 
    ? "w-24 h-24 border-4 border-slate-100 shadow-sm" 
    : "w-11 h-11 border border-slate-200 group-hover:border-primary/20";

  const textClasses = size === 'lg' ? "text-2xl" : "text-xs font-bold text-slate-500";

  return (
    <div className={`${containerClasses} rounded-full overflow-hidden bg-slate-50 flex items-center justify-center transition-colors`}>
      {photoUrl && !imageError ? (
        <img 
          src={photoUrl} 
          alt={name} 
          className="w-full h-full object-cover" 
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className={`${textClasses} font-bold text-slate-400`}>{initials}</span>
      )}
    </div>
  );
};

interface TeachersProps {
  academicYear?: string;
}

export const Teachers: React.FC<TeachersProps> = ({ academicYear = 'AY 2024-25' }) => {
  const [teachers, setTeachers] = useState<Teacher[]>(demoTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'AM'>('EN');

  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'validating' | 'success'>('idle');
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [inviteGrade, setInviteGrade] = useState('Grade 9');
  const [isInviteGradeOpen, setIsInviteGradeOpen] = useState(false);
  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];

  const [inviteSubjects, setInviteSubjects] = useState<string[]>(['Mathematics']);
  const [isInviteSubjectOpen, setIsInviteSubjectOpen] = useState(false);
  const subjects = ["Mathematics", "Science", "History", "English", "Arts"];

  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  React.useEffect(() => {
    return () => {
      if (importIntervalRef.current) clearInterval(importIntervalRef.current);
    };
  }, []);

  const downloadTemplate = () => {
    const csvContent = "FullName,Email,EmployeeId,PrimarySubject,Sections\nJohn Doe,john.doe@school.edu,EMP001,Mathematics,9A;10B\nJane Smith,jane.smith@school.edu,EMP002,Science,8C";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teachers_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statusFilters = ["All", "Invited", "Active", "On Leave", "Inactive"];

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBulkFile(e.target.files[0]);
    }
  };

  const closeBulkModal = () => {
    if (importIntervalRef.current) {
      clearInterval(importIntervalRef.current);
      importIntervalRef.current = null;
    }
    setShowBulkModal(false);
    setBulkFile(null);
    setImportStatus('idle');
    setImportProgress(0);
  };

  const startBulkImport = () => {
    if (!bulkFile) return;
    
    if (importIntervalRef.current) clearInterval(importIntervalRef.current);
    
    setImportStatus('uploading');
    setImportProgress(0);

    let progress = 0;
    importIntervalRef.current = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 2;
      
      if (progress >= 100) {
        progress = 100;
        if (importIntervalRef.current) {
          clearInterval(importIntervalRef.current);
          importIntervalRef.current = null;
        }
        setImportProgress(100);
        setImportStatus('success');
        
        // Add a mock new teacher to the state
        const newTeacher: Teacher = {
          id: Math.random().toString(36).substr(2, 9),
          name: 'Newly Imported Teacher',
          employeeId: `T-2024-00${teachers.length + 1}`,
          email: 'new.teacher@school.edu',
          phone: '+251 900 000 000',
          status: 'Invited',
          subjects: ['English'],
          assignedSections: ['9A'],
          bioEn: 'Freshly imported teacher via bulk upload.',
          bioAm: 'Be bulk upload amakayinet yedesele memhir.',
          totalAlerts: 0,
          parentAnnouncements: 0,
          joiningDate: new Date().toISOString().split('T')[0],
          photoUrl: 'https://images.unsplash.com/photo-1544717297-fa154daaf761?w=120&h=120&fit=crop'
        };
        setTeachers(prev => [newTeacher, ...prev]);
      } else {
        setImportProgress(progress);
        if (progress > 60) {
          setImportStatus('validating');
        }
      }
    }, 150);
  };

  const invitedTeachersCount = useMemo(() => {
    return teachers.filter(t => t.status === 'Invited').length;
  }, [teachers]);

  const handleBulkInvite = () => {
    setTeachers(prev => prev.map(t => t.status === 'Invited' ? { ...t, status: 'Invited' } : t));
    setShowBulkInviteModal(false);
  };

  const [inviteAssignments, setInviteAssignments] = useState<{ grades: string[]; sections: string[] }[]>([]);
  const [availableSections, setAvailableSections] = useState(["A", "B", "C", "D"]);

  const handleSendInvitation = () => {
    if (!inviteName || !inviteEmail || inviteAssignments.length === 0) return;
    
    const allSections: string[] = [];
    inviteAssignments.forEach(attr => {
      attr.grades.forEach(grade => {
        const gNum = grade.replace('Grade ', '');
        attr.sections.forEach(s => {
          allSections.push(`${gNum}${s}`);
        });
      });
    });

    const newTeacher: Teacher = {
      id: Math.random().toString(36).substr(2, 9),
      name: inviteName,
      employeeId: `T-2024-0${teachers.length + 1}`,
      email: inviteEmail,
      phone: '', 
      status: 'Invited',
      subjects: inviteSubjects,
      assignedSections: allSections,
      bioEn: `Teacher specializing in ${inviteSubjects.join(', ')}.`,
      bioAm: '',
      totalAlerts: 0,
      parentAnnouncements: 0,
      joiningDate: new Date().toISOString().split('T')[0],
      photoUrl: ''
    };
    setTeachers(prev => [newTeacher, ...prev]);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    setInviteAssignments([]);
  };

  const [sortBy, setSortBy] = useState('name');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  const toggleTeacherSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTeacherIds(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toggleAllTeachers = () => {
    if (selectedTeacherIds.length === filteredTeachers.length) {
      setSelectedTeacherIds([]);
    } else {
      setSelectedTeacherIds(filteredTeachers.map(t => t.id));
    }
  };

  const filteredTeachers = useMemo(() => {
    let result = teachers.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filterType === 'All' || t.status === filterType;
      return matchesSearch && statusMatch;
    });

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime());
    } else if (sortBy === 'status') {
      result.sort((a, b) => a.status.localeCompare(b.status));
    }

    return result;
  }, [teachers, searchTerm, filterType, sortBy]);

  return (
    <div className="min-h-full bg-slate-50 flex flex-col relative">
      {/* Dynamic Header */}
      <div className="bg-white px-6 py-6 space-y-4 border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-xl shadow-md">
              Academic year {academicYear}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2.5 bg-accent/10 text-primary rounded-xl border border-accent/20 font-bold text-sm flex items-center gap-2 hover:bg-accent/20 transition-all active:scale-95 shadow-sm"
            >
              <FilePlus className="w-4 h-4" />
              Bulk Import
            </button>
            {invitedTeachersCount > 0 && (
              <button 
                onClick={() => setShowBulkInviteModal(true)}
                className="px-4 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
              >
                <Mail className="w-4 h-4" />
                Bulk Invite ({invitedTeachersCount})
              </button>
            )}
            <button 
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              Invite Teacher
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
            {statusFilters.map(filter => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap shrink-0 border ${
                  filterType === filter 
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/10' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-primary/40 hover:text-primary shadow-sm'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search teachers, IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all font-medium"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="p-3 bg-slate-50 text-slate-600 rounded-2xl border border-transparent hover:bg-white hover:border-slate-200 transition-all active:scale-95 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline-block">{sortBy}</span>
            </button>

            <AnimatePresence>
              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="dropdown-menu !right-0 left-auto top-full mt-2 w-48 z-20"
                  >
                    {[
                      { id: 'name', label: 'By Name' },
                      { id: 'newest', label: 'Newest Joining' },
                      { id: 'status', label: 'By Status' },
                    ].map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSortBy(s.id);
                          setIsSortOpen(false);
                        }}
                        className={`dropdown-item ${sortBy === s.id ? 'bg-primary text-white hover:bg-primary/90 hover:text-white' : ''}`}
                      >
                        {s.label}
                      </div>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Teacher List Area */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', count: teachers.length, icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
            { label: 'Active', count: teachers.filter(t => t.status === 'Active').length, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Invited', count: teachers.filter(isInvitedTeacher).length, icon: Mail, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'On Leave', count: teachers.filter(t => t.status === 'On Leave').length, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((stat) => (
            <div key={stat.label} className={`p-3 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center gap-3`}>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{stat.label}</p>
                <p className="text-sm font-bold text-slate-900 leading-none">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleAllTeachers}
              className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                selectedTeacherIds.length > 0 && selectedTeacherIds.length === filteredTeachers.length
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-slate-300'
              }`}
            >
              {selectedTeacherIds.length > 0 && (
                selectedTeacherIds.length === filteredTeachers.length ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-2 h-0.5 bg-slate-400" />
              )}
            </button>
            <span>Active Staff ({filteredTeachers.length} Members)</span>
          </div>
          <div className="flex items-center gap-8 lg:gap-16 mr-20">
            <span className="hidden md:inline-block w-24 text-center">Status</span>
            <span className="hidden lg:inline-block w-32">Department</span>
            <span className="hidden xl:inline-block w-40">Sections</span>
          </div>
        </div>

        <div className="space-y-2">
          {filteredTeachers.map((teacher, idx) => (
            <motion.div 
              key={teacher.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => setSelectedTeacher(teacher)}
              className={`group bg-white border rounded-xl p-3 flex items-center hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer relative ${
                selectedTeacherIds.includes(teacher.id) ? 'border-primary/40 bg-primary/5 shadow-md ring-1 ring-primary/10' : 'border-slate-100'
              }`}
            >
              {/* Checkbox */}
              <div 
                onClick={(e) => toggleTeacherSelection(teacher.id, e)}
                className={`w-5 h-5 rounded-lg border mr-4 transition-all flex items-center justify-center shrink-0 ${
                  selectedTeacherIds.includes(teacher.id)
                    ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20'
                    : 'bg-white border-slate-200 group-hover:border-primary/30'
                }`}
              >
                {selectedTeacherIds.includes(teacher.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>

              {/* Profile & Identity */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative">
                  <TeacherAvatar photoUrl={teacher.photoUrl} name={teacher.name} size="sm" />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${
                    teacher.status === 'Active' ? 'bg-green-500' :
                    teacher.status === 'Invited' ? 'bg-amber-500' :
                    teacher.status === 'On Leave' ? 'bg-blue-500' : 'bg-slate-300'
                  }`} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{teacher.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-1 rounded uppercase tracking-wider">{teacher.employeeId}</span>
                    <span className="text-[10px] text-slate-400 truncate hidden sm:inline-block">{teacher.email}</span>
                  </div>
                </div>
              </div>

              {/* Attributes Column */}
              <div className="flex items-center gap-8 lg:gap-16 ml-4">
                {/* Status Badge */}
                <div className="hidden md:flex justify-center w-24">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-center min-w-[70px] ${getTeacherStatusClasses(teacher.status)}`}>
                    {teacher.status}
                  </span>
                </div>

                {/* Department / Subject */}
                <div className="hidden lg:flex flex-col w-32">
                  <span className="text-[11px] font-bold text-slate-700 truncate">{teacher.subjects.join(', ')}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Department</span>
                </div>

                {/* Assigned Sections */}
                <div className="hidden xl:flex items-center gap-1 w-40 overflow-hidden">
                  {teacher.assignedSections.slice(0, 3).map(section => (
                    <span key={section} className="px-1.5 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-bold rounded border border-slate-100">
                      {section}
                    </span>
                  ))}
                  {teacher.assignedSections.length > 3 && (
                    <span className="text-[9px] font-bold text-slate-300 ml-1">+{teacher.assignedSections.length - 3}</span>
                  )}
                </div>
              </div>

              {/* Quick Action */}
              <div className="ml-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                <button className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-100 mx-1" />
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="font-bold text-slate-700">No teachers found</p>
              <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedTeacherIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-6 border border-slate-700/50 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-sm">
                {selectedTeacherIds.length}
              </div>
              <span className="text-sm font-bold text-slate-300">Teachers Selected</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 hover:bg-white/10 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Assign Classes
              </button>
              <button className="px-4 py-2 hover:bg-white/10 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent" />
                Assign Subjects
              </button>
              <div className="w-px h-6 bg-slate-700 mx-1" />
              <button 
                onClick={() => setSelectedTeacherIds([])}
                className="px-4 py-2 hover:bg-red-500/10 text-red-400 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals & Detail Page */}
      <AnimatePresence>
        {selectedTeacher && (
          <TeacherDetail 
            teacher={selectedTeacher} 
            onClose={() => setSelectedTeacher(null)}
            language={language}
            setLanguage={setLanguage}
            academicYear={academicYear}
          />
        )}
        {showInviteModal && (
          <InvitationModal 
            onClose={() => setShowInviteModal(false)}
            inviteName={inviteName}
            setInviteName={setInviteName}
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            inviteAssignments={inviteAssignments}
            setInviteAssignments={setInviteAssignments}
            inviteSubjects={inviteSubjects}
            setInviteSubjects={setInviteSubjects}
            isInviteSubjectOpen={isInviteSubjectOpen}
            setIsInviteSubjectOpen={setIsInviteSubjectOpen}
            grades={grades}
            subjects={subjects}
            availableSections={availableSections}
            onAddSection={(newSection) => {
              if (newSection && !availableSections.includes(newSection)) {
                setAvailableSections([...availableSections, newSection]);
              }
            }}
            onInvite={handleSendInvitation}
          />
        )}
        {showBulkModal && (
          <BulkImportModal 
            onClose={closeBulkModal}
            importStatus={importStatus}
            importProgress={importProgress}
            bulkFile={bulkFile}
            fileInputRef={fileInputRef}
            handleBulkFileChange={handleBulkFileChange}
            startBulkImport={startBulkImport}
            downloadTemplate={downloadTemplate}
          />
        )}
        {showBulkInviteModal && (
          <BulkInviteModal 
            count={invitedTeachersCount}
            onClose={() => setShowBulkInviteModal(false)}
            onConfirm={handleBulkInvite}
          />
        )}
      </AnimatePresence>
    </div>
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6 text-center"
      >
        {step === 'confirm' && (
          <>
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Send Bulk Invitations</h3>
              <p className="text-sm text-slate-500">
                You are about to send official portal invitations to <span className="font-bold text-slate-900">{count} new teachers</span>. Each will receive an email with their login credentials.
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
          <div className="space-y-6 py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sending Invites...</span>
                <span className="text-xs font-mono font-bold text-primary">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">Please do not close this window</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">All Invites Sent!</h3>
              <p className="text-sm text-slate-500">
                All teachers have been moved to <span className="font-bold text-amber-600">Pending</span> status. You can track their acceptance in the list.
              </p>
            </div>
            <button 
              onClick={onConfirm}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 mt-4"
            >
              Continue
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

interface InvitationModalProps {
  onClose: () => void;
  inviteName: string;
  setInviteName: (n: string) => void;
  inviteEmail: string;
  setInviteEmail: (e: string) => void;
  inviteAssignments: { grades: string[]; sections: string[] }[];
  setInviteAssignments: React.Dispatch<React.SetStateAction<{ grades: string[]; sections: string[] }[]>>;
  inviteSubjects: string[];
  setInviteSubjects: (s: string[]) => void;
  isInviteSubjectOpen: boolean;
  setIsInviteSubjectOpen: (o: boolean) => void;
  grades: string[];
  subjects: string[];
  availableSections: string[];
  onAddSection: (section: string) => void;
  onInvite: () => void;
}

const InvitationModal: React.FC<InvitationModalProps> = ({ 
  onClose, 
  inviteName,
  setInviteName,
  inviteEmail,
  setInviteEmail,
  inviteAssignments,
  setInviteAssignments,
  inviteSubjects, 
  setInviteSubjects, 
  isInviteSubjectOpen, 
  setIsInviteSubjectOpen, 
  grades, 
  subjects,
  availableSections,
  onAddSection,
  onInvite
}) => {
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  const addAssignment = () => {
    setInviteAssignments([...inviteAssignments, { grades: [grades[0]], sections: [] }]);
  };

  const removeAssignment = (index: number) => {
    setInviteAssignments(inviteAssignments.filter((_, i) => i !== index));
  };

  const toggleGrade = (index: number, grade: string) => {
    const newAssignments = [...inviteAssignments];
    const currentGrades = newAssignments[index].grades;
    if (currentGrades.includes(grade)) {
      // Don't allow removing the last grade
      if (currentGrades.length > 1) {
        newAssignments[index].grades = currentGrades.filter(g => g !== grade);
      }
    } else {
      newAssignments[index].grades = [...currentGrades, grade];
    }
    setInviteAssignments(newAssignments);
  };

  const toggleSection = (index: number, section: string) => {
    const newAssignments = [...inviteAssignments];
    const currentSections = newAssignments[index].sections;
    if (currentSections.includes(section)) {
      newAssignments[index].sections = currentSections.filter(s => s !== section);
    } else {
      newAssignments[index].sections = [...currentSections, section];
    }
    setInviteAssignments(newAssignments);
  };

  const toggleSubject = (subject: string) => {
    if (inviteSubjects.includes(subject)) {
      setInviteSubjects(inviteSubjects.filter(s => s !== subject));
    } else {
      setInviteSubjects([...inviteSubjects, subject]);
    }
  };

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      onAddSection(newSectionName.trim().toUpperCase());
      setNewSectionName('');
      setIsAddingSection(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-3xl p-4 md:p-8 w-full max-w-xl shadow-2xl space-y-6 relative max-h-[95vh] md:max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <button onClick={onClose} className="absolute right-4 top-4 md:right-6 md:top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
          <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-bold text-slate-900">Invite New Teacher</h3>
          <p className="text-xs md:text-sm text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Add a professional member to your team</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
            <input 
              type="text" 
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-slate-700 text-sm" 
              placeholder="Enter teacher name" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Official Email</label>
            <input 
              type="email" 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-slate-700 text-sm" 
              placeholder="email@school.edu" 
            />
          </div>
        </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Subjects (Select Multiple)</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSubject(s)}
                  className={`px-4 py-2 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-2 ${
                    inviteSubjects.includes(s)
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-[1.02] ring-2 ring-primary/10'
                      : 'bg-white text-slate-400 border-slate-100 hover:border-primary/20'
                  }`}
                >
                  {s}
                  {inviteSubjects.includes(s) && <CheckCircle2 className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1 mb-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Class Assignments</label>
              <button 
                onClick={addAssignment}
                className="text-[11px] font-bold text-primary hover:bg-primary/5 px-2 py-1 rounded-lg transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Class
              </button>
            </div>

            <div className="space-y-4">
              {inviteAssignments.map((assignment, idx) => (
                <div key={idx} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4 relative group/assignment">
                  <button 
                    onClick={() => removeAssignment(idx)}
                    className="absolute -top-2 -right-2 p-2 bg-white border border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100 hover:shadow-lg hover:shadow-red-500/10 rounded-xl opacity-0 group-hover/assignment:opacity-100 transition-all z-10"
                    title="Remove assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                    <div className="col-span-3 space-y-4">
                      {/* Grades Multi-select */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Grades (Select Multiple)</span>
                        <div className="flex flex-wrap gap-2">
                          {grades.map((g) => (
                            <button
                              key={g}
                              onClick={() => toggleGrade(idx, g)}
                              className={`px-4 py-2 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-2 ${
                                assignment.grades.includes(g)
                                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-[1.02] ring-2 ring-primary/10'
                                  : 'bg-white text-slate-400 border-slate-100 hover:border-primary/20'
                              }`}
                            >
                              {g}
                              {assignment.grades.includes(g) && <CheckCircle2 className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between ml-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Sections (Select Multiple)</span>
                          {!isAddingSection ? (
                            <button 
                              onClick={() => setIsAddingSection(true)}
                              className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors flex items-center gap-1 group/add"
                              title="Add new section option"
                            >
                              <Plus className="w-4 h-4 transition-transform group-hover/add:rotate-90" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                               <input 
                                autoFocus
                                type="text"
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                                className="w-14 h-6 text-[11px] font-bold px-2 border border-primary/30 rounded-lg outline-none bg-white"
                                placeholder="SEC"
                              />
                              <button onClick={handleAddSection} className="p-1 hover:bg-green-100 text-green-600 rounded-lg transition-colors">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => { setIsAddingSection(false); setNewSectionName(''); }} className="p-1 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                          {availableSections.map(s => (
                            <button
                              key={s}
                              onClick={() => toggleSection(idx, s)}
                              className={`px-4 py-2 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-2 ${
                                assignment.sections.includes(s)
                                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-[1.02] ring-2 ring-primary/10'
                                  : 'bg-white text-slate-400 border-slate-100 hover:border-primary/20'
                              }`}
                            >
                              {s}
                              {assignment.sections.includes(s) && <CheckCircle2 className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                </div>
              ))}

              {inviteAssignments.length === 0 && (
                <div onClick={addAssignment} className="border-2 border-dashed border-slate-200 rounded-2xl py-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-primary/20 transition-all text-slate-400 hover:text-primary">
                  <Plus className="w-6 h-6 opacity-30" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">No classes assigned yet</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onInvite}
            disabled={!inviteName || !inviteEmail || inviteAssignments.length === 0}
            className={`flex-1 py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] ${
              !inviteName || !inviteEmail || inviteAssignments.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-primary text-white shadow-primary/20'
            }`}
          >
            Send Invitation
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface BulkImportModalProps {
  onClose: () => void;
  importStatus: string;
  importProgress: number;
  bulkFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleBulkFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startBulkImport: () => void;
  downloadTemplate: () => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ 
  onClose, 
  importStatus, 
  importProgress, 
  bulkFile, 
  fileInputRef, 
  handleBulkFileChange, 
  startBulkImport, 
  downloadTemplate 
}) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
  >
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Bulk Import Teachers</h3>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {importStatus === 'success' ? (
        <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center"
          >
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </motion.div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">Import Successful!</h4>
            <p className="text-sm text-slate-500 max-w-[280px]">12 new teachers have been successfully imported and added to the invitation queue.</p>
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            Done
          </button>
        </div>
      ) : (
        <>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleBulkFileChange} 
            className="hidden" 
            accept=".csv,.xlsx" 
          />
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer group ${
              bulkFile ? 'border-primary/20 bg-primary/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
              bulkFile ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/5 text-primary'
            }`}>
              <Upload className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              {bulkFile ? bulkFile.name : 'Drop CSV file here or click to browse'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {bulkFile ? `${(bulkFile.size / 1024).toFixed(1)} KB` : 'Maximum file size: 5MB'}
            </p>
          </div>

          {(importStatus === 'uploading' || importStatus === 'validating') && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {importStatus === 'uploading' ? (
                    <Upload className="w-4 h-4 text-primary animate-bounce" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-primary animate-pulse" />
                  )}
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                    {importStatus === 'uploading' ? 'Uploading Data...' : 'Validating Rows...'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-primary">{importProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${importProgress}%` }}
                  transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center font-medium">
                {importStatus === 'uploading' 
                  ? (importProgress < 30 ? 'Reading CSV file...' : 'Uploading rows to cloud...') 
                  : (importProgress < 80 ? 'Validating email formats...' : 'Saving teacher records...')}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-border-soft rounded-xl">
            <FileText className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Download Template</p>
              <p className="text-[10px] text-slate-400">Ensure your CSV format matches our system</p>
            </div>
            <button 
              onClick={downloadTemplate}
              className="text-xs font-bold text-primary underline hover:text-primary/80 transition-colors"
            >
              Get CSV
            </button>
          </div>

          <button 
            onClick={startBulkImport}
            disabled={!bulkFile || importStatus !== 'idle'}
            className={`w-full py-3.5 rounded-xl font-bold transition-all ${
              !bulkFile || importStatus !== 'idle'
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-primary text-white shadow-lg shadow-primary/20 active:scale-[0.98]'
            }`}
          >
            {importStatus === 'idle' ? 'Start Import' : 'Processing...'}
          </button>
        </>
      )}
    </motion.div>
  </motion.div>
);

interface TeacherDetailProps {
  teacher: Teacher;
  onClose: () => void;
  language: 'EN' | 'AM';
  setLanguage: (l: 'EN' | 'AM') => void;
  academicYear: string;
}

const TeacherDetail: React.FC<TeacherDetailProps> = ({ 
  teacher, 
  onClose, 
  language, 
  setLanguage,
  academicYear
}) => (
  <motion.div 
    initial={{ x: '100%' }}
    animate={{ x: 0 }}
    exit={{ x: '100%' }}
    className="fixed inset-0 z-50 bg-white flex flex-col"
  >
    <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onClose} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h3 className="text-lg font-bold text-slate-900">Teacher Profile</h3>
      </div>
      <div className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg shadow-sm">
        {academicYear}
      </div>
    </div>

    <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-8">
      {/* Profile Card */}
      <div className="flex items-center gap-6">
        <TeacherAvatar photoUrl={teacher.photoUrl} name={teacher.name} size="lg" />
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">{teacher.name}</h2>
          <p className="text-sm font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded inline-block">{teacher.employeeId}</p>
          <div className="flex items-center gap-4 pt-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getTeacherStatusClasses(teacher.status)}`}>
              {teacher.status}
            </span>
          </div>
        </div>
      </div>

      {/* Translation Toggle */}
      <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Multilingual Bio Preview</h4>
          </div>
          <div className="flex bg-white p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setLanguage('EN')}
              className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${language === 'EN' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLanguage('AM')}
              className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${language === 'AM' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Amharic
            </button>
          </div>
        </div>
        <div className="bg-white/60 p-4 rounded-xl border border-slate-100">
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {language === 'EN' ? teacher.bioEn : teacher.bioAm}
          </p>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Weekly Class Schedule</h4>
          <span className="text-[10px] font-bold text-primary">Current Term</span>
        </div>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left font-bold pb-2 pr-4">MON</th>
                <th className="text-left font-bold pb-2 pr-4">TUE</th>
                <th className="text-left font-bold pb-2 pr-4">WED</th>
                <th className="text-left font-bold pb-2 pr-4">THU</th>
                <th className="text-left font-bold pb-2 pr-4">FRI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pr-4 py-2">
                  <div className="bg-primary/5 p-2 rounded border-l-2 border-primary">
                    <p className="font-bold text-primary">9B</p>
                    <p className="text-[10px] text-primary/60">08:00 AM</p>
                  </div>
                </td>
                <td className="pr-4 py-2">
                  <div className="bg-slate-50 p-2 rounded">
                    <p className="font-bold text-slate-400">-</p>
                  </div>
                </td>
                <td className="pr-4 py-2">
                  <div className="bg-primary/5 p-2 rounded border-l-2 border-primary">
                    <p className="font-bold text-primary">10A</p>
                    <p className="text-[10px] text-primary/60">09:30 AM</p>
                  </div>
                </td>
                <td className="pr-4 py-2">
                  <div className="bg-primary/5 p-2 rounded border-l-2 border-primary">
                    <p className="font-bold text-primary">9B</p>
                    <p className="text-[10px] text-primary/60">11:00 AM</p>
                  </div>
                </td>
                <td className="pr-4 py-2">
                  <div className="bg-slate-50 p-2 rounded">
                    <p className="font-bold text-slate-400">-</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Widget */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Bell className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Alerts Sent</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{teacher.totalAlerts}</p>
        </div>
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-accent">
            <Megaphone className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Announcements</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{teacher.parentAnnouncements}</p>
        </div>
      </div>
    </div>

    {/* Detail Actions */}
    <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 flex gap-3">
      <button className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold border border-slate-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
        <Edit2 className="w-4 h-4" />
        Edit Profile
      </button>
      <button className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
        <BookOpen className="w-4 h-4" />
        Reassign Classes
      </button>
      <button className="p-3.5 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition-colors active:scale-95">
        <UserX className="w-5 h-5" />
      </button>
    </div>
  </motion.div>
);
