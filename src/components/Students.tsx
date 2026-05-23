import React, { useState, useMemo } from 'react';
import {
  Users, Search, UserPlus, Link2, Link2Off, MoreVertical,
  GraduationCap, ChevronRight, ShieldCheck, AlertCircle,
  FileText, Edit3, Mail, Phone, ArrowUpDown, X, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Parent } from '../types';
import { ApiStudent, ApiParent, studentsApi, StudentGender, StudentStatus } from '../lib/api';
import { useStudents } from '../hooks/useStudents';
import { useParents } from '../hooks/useParents';
import { useGrades } from '../hooks/useGrades';
import { useSections } from '../hooks/useSections';

// ---------------------------------------------------------------------------
// Mappers: API shape → UI shape
// ---------------------------------------------------------------------------
function mapStudent(s: ApiStudent): Student {
  return {
    id: s.id,
    name: `${s.first_name} ${s.last_name}`.trim(),
    firstName: s.first_name,
    lastName: s.last_name,
    grade: s.grade_name,
    gradeId: s.grade_id,
    section: s.section_name,
    sectionId: s.current_section ?? '',
    rollNo: s.roll_no,
    gender: s.gender,
    dateOfBirth: s.date_of_birth,
    admissionDate: s.admission_date,
    photoUrl: s.photo,
    registrationStatus:
      s.status === 'ACTIVE' ? 'Registered'
      : s.status === 'WITHDRAWN' ? 'Withdrawn'
      : s.status === 'GRADUATED' ? 'Graduated'
      : 'Pending',
    languagePreference: 'English',
    branchId: s.branch,
    organizationId: s.organization,
    academicYearId: s.academic_year_id,
  };
}

function mapParent(p: ApiParent): Parent {
  return {
    id: p.id,
    name: p.user_details?.name ?? '',
    phone: p.user_details?.phone_number ?? '',
    email: p.user_details?.email ?? '',
    status: p.is_active ? 'Active' : 'Invited',
    linkedStudents: p.student_details?.map((s) => s.id) ?? [],
    languagePreference: 'English',
    isPrimaryContact: true,
    isActive: p.is_active,
    occupation: p.occupation,
    emergencyContactName: p.emergency_contact_name,
    emergencyContactPhone: p.emergency_contact_phone,
  };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface StudentsProps {
  academicYear: string;
  branchId: string | null;
  organizationId: string | null;
  academicYearId: string | null;
}

export const Students: React.FC<StudentsProps> = ({
  academicYear, branchId, organizationId, academicYearId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unlinked'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [studentToLink, setStudentToLink] = useState<Student | null>(null);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [smsStudent, setSmsStudent] = useState<Student | null>(null);
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [sectionFilter, setSectionFilter] = useState<string>('All');
  const [newStudentForm, setNewStudentForm] = useState({
    firstName: '',
    lastName: '',
    rollNo: '',
    gradeId: '',
    sectionId: '',
    gender: 'MALE' as StudentGender,
    dateOfBirth: '',
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE' as StudentStatus,
  });
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [studentFormError, setStudentFormError] = useState<string | null>(null);

  // API hooks
  const {
    students: rawStudents,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } =
    useStudents({ branchId, organizationId, academicYearId });
  const { parents: rawParents } = useParents({ branchId, organizationId });
  const { grades } = useGrades(branchId);
  const { sections } = useSections(branchId, academicYearId);

  // Map to UI shapes
  const students = useMemo(() => rawStudents.map(mapStudent), [rawStudents]);
  const parents = useMemo(() => rawParents.map(mapParent), [rawParents]);

  // Unique section names for filter dropdown
  const sectionNames = useMemo(
    () => Array.from(new Set(sections.map((s) => s.name))),
    [sections],
  );
  const sectionsForSelectedGrade = useMemo(
    () =>
      newStudentForm.gradeId
        ? sections.filter((section) => section.grade === newStudentForm.gradeId)
        : sections,
    [newStudentForm.gradeId, sections],
  );

  const filteredStudents = useMemo(() =>
    students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || !student.parentId;
      const matchesGrade = gradeFilter === 'All' || student.grade === gradeFilter;
      const matchesSection = sectionFilter === 'All' || student.section === sectionFilter;
      return matchesSearch && matchesTab && matchesGrade && matchesSection;
    }),
    [students, searchQuery, activeTab, gradeFilter, sectionFilter],
  );

  const stats = useMemo(() => ({
    total: students.length,
    linked: students.filter((s) => s.parentId).length,
    unlinked: students.filter((s) => !s.parentId).length,
    withdrawn: students.filter((s) => s.registrationStatus === 'Withdrawn').length,
  }), [students]);

  const resetStudentForm = () => {
    setNewStudentForm({
      firstName: '',
      lastName: '',
      rollNo: '',
      gradeId: '',
      sectionId: '',
      gender: 'MALE',
      dateOfBirth: '',
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    });
    setStudentFormError(null);
  };

  // Loading / error states
  if (studentsLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading students...</p>
        </div>
      </div>
    );
  }

  if (studentsError) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50/30 p-8">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 max-w-md text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm font-bold text-red-600">Failed to load students</p>
          <p className="text-xs text-red-400">{studentsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-8 py-4 md:py-6 sticky top-0 z-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 md:gap-3">
              Students
              <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/5 text-primary rounded-full border border-primary/10 uppercase tracking-wider whitespace-nowrap">
                {academicYear}
              </span>
            </h1>
            <p className="hidden md:block text-sm text-slate-500 font-medium italic">Monitor registrations and manage parent linkages</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => setIsImportModalOpen(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <FileText className="w-4 h-4 shrink-0" /><span className="truncate">Import</span>
            </button>
            <button onClick={() => { resetStudentForm(); setIsAddModalOpen(true); }}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-primary text-white rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
              <UserPlus className="w-4 h-4 shrink-0" /><span className="truncate">New Student</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mt-6 md:mt-8">
          {[
            { label: 'Total Students', value: stats.total, icon: Users, color: 'text-primary' },
            { label: 'Linked to Parents', value: stats.linked, icon: ShieldCheck, color: 'text-emerald-500' },
            { label: 'Unlinked Students', value: stats.unlinked, icon: Link2Off, color: 'text-amber-500' },
            { label: 'Withdrawn', value: stats.withdrawn, icon: AlertCircle, color: 'text-slate-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 group hover:bg-white hover:border-primary/20 transition-all">
              <div className={`w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
              <button onClick={() => setActiveTab('all')}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'all' ? 'bg-primary text-white shadow-md shadow-primary/10' : 'text-slate-500 hover:text-primary'
                }`}>
                All Students
              </button>
              <button onClick={() => setActiveTab('unlinked')}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'unlinked' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10' : 'text-slate-500 hover:text-amber-500'
                }`}>
                Unlinked
                {stats.unlinked > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'unlinked' ? 'bg-white text-amber-500' : 'bg-amber-100 text-amber-600'}`}>
                    {stats.unlinked}
                  </span>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto">
              <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}
                className="flex-1 lg:flex-none bg-white border border-slate-200 rounded-xl px-2 md:px-3 py-2 text-[10px] md:text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/10">
                <option value="All">All Grades</option>
                {grades.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
              <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}
                className="flex-1 lg:flex-none bg-white border border-slate-200 rounded-xl px-2 md:px-3 py-2 text-[10px] md:text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/10">
                <option value="All">All Sections</option>
                {sectionNames.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="relative w-full lg:w-48 xl:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search students..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-[10px] md:text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary/10 transition-all outline-none" />
              </div>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade/Section</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Link</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence mode="popLayout">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <motion.tr key={student.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          onClick={() => setSelectedStudent(student)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                <GraduationCap className="w-5 h-5 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{student.name}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.rollNo || student.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-slate-700">{student.grade} - {student.section}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                student.registrationStatus === 'Registered' ? 'bg-emerald-500' :
                                student.registrationStatus === 'Pending' ? 'bg-amber-500' : 'bg-slate-300'
                              }`} />
                              <span className="text-xs font-bold text-slate-600">{student.registrationStatus}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {student.parentId ? (
                              <div className="flex items-center gap-2 text-emerald-600">
                                <Link2 className="w-4 h-4" /><span className="text-xs font-bold">Linked</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-amber-500">
                                <Link2Off className="w-4 h-4" /><span className="text-xs font-bold">Unlinked</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!student.parentId && (
                                <button onClick={(e) => { e.stopPropagation(); setStudentToLink(student); }}
                                  className="p-2 bg-primary/5 text-primary rounded-lg hover:bg-primary hover:text-white transition-all" title="Link Parent">
                                  <Link2 className="w-4 h-4" />
                                </button>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}
                                className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 hover:text-slate-600 transition-all">
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                              <Search className="w-10 h-10 text-slate-200" />
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-slate-900">No students found</h3>
                              <p className="text-sm text-slate-500 font-medium">Try adjusting your search or filters</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Student Detail Side-Sheet */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  selectedStudent.registrationStatus === 'Registered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>{selectedStudent.registrationStatus}</div>
                <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-8 space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center relative">
                    <GraduationCap className="w-12 h-12 text-slate-300" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-[2rem]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{selectedStudent.name}</h2>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Roll: {selectedStudent.rollNo || '—'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Academic Info</p>
                    <p className="text-sm font-bold text-slate-900">{selectedStudent.grade}</p>
                    <p className="text-xs text-slate-500 font-medium">Section {selectedStudent.section}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Preference</p>
                    <p className="text-sm font-bold text-slate-900">{selectedStudent.languagePreference}</p>
                    <p className="text-xs text-slate-500 font-medium">Primary Language</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parental Connection</h4>
                  {selectedStudent.parentId ? (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-emerald-100 flex items-center justify-center shrink-0">
                        <Link2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-emerald-600">Successfully Linked</p>
                        <p className="text-xs text-emerald-500 font-medium leading-none mt-1">Updates are synchronized</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-amber-100 flex items-center justify-center shrink-0">
                        <Link2Off className="w-6 h-6 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-amber-600">No Parent Linked</p>
                        <p className="text-xs text-amber-500 font-medium leading-none mt-1">Manual linkage required</p>
                      </div>
                      <button onClick={() => setStudentToLink(selectedStudent)}
                        className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all active:scale-95">
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Methods</h4>
                  <div className="space-y-2">
                    <button onClick={() => {
                        const parent = parents.find((p) => p.id === selectedStudent.parentId);
                        setSmsStudent(selectedStudent);
                        setSmsPhone(parent?.phone || '');
                        setSmsMessage(`Hello from EduGov Academy. We have an update regarding ${selectedStudent.name}.`);
                        setIsSMSModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-primary/20 transition-all group shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Send SMS to Parent</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-primary/20 transition-all group shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Call Emergency Contact</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                    </button>
                  </div>
                </div>
                {selectedStudent.parentId && (() => {
                  const parent = parents.find((p) => p.id === selectedStudent.parentId);
                  if (!parent) return null;
                  return (
                    <div className="pt-6 border-t border-slate-100 space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Information</h4>
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                            <Users className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{parent.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{parent.relationship || 'Primary Contact'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Phone className="w-3.5 h-3.5" />{parent.phone}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Mail className="w-3.5 h-3.5" />{parent.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="p-6 border-t border-slate-100 flex gap-3">
                <button onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 py-3 bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center gap-2">
                  <Edit3 className="w-4 h-4" />Edit Profile
                </button>
                <button className="py-3 px-4 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-500 hover:border-red-100 transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Student Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-sm">
                    <Edit3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Student</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Updating {selectedStudent.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input type="text" defaultValue={selectedStudent.name}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll No</label>
                    <input type="text" defaultValue={selectedStudent.rollNo} disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 outline-none cursor-not-allowed" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</label>
                    <select defaultValue={selectedStudent.grade}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                      {grades.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section</label>
                    <select defaultValue={selectedStudent.section}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                      {sectionNames.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                    <select defaultValue={selectedStudent.registrationStatus}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                      <option>Registered</option><option>Pending</option><option>Withdrawn</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-8 border-t border-slate-100 flex items-center justify-end gap-4">
                <button onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Cancel</button>
                <button onClick={() => setIsEditModalOpen(false)}
                  className="bg-primary text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95 transition-all">Save Changes</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SMS Modal */}
      <AnimatePresence>
        {isSMSModalOpen && smsStudent && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSMSModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8">
              <div className="text-center space-y-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Send SMS Notification</h3>
                  <p className="text-sm text-slate-500 font-medium">To parent of <b>{smsStudent.name}</b></p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recipient Number</label>
                  <input type="tel" value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="+251 ..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Body</label>
                  <textarea rows={4} value={smsMessage} onChange={(e) => setSmsMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    placeholder="Enter message content..." />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setIsSMSModalOpen(false)}
                  className="flex-1 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">Cancel</button>
                <button onClick={() => setIsSMSModalOpen(false)}
                  className="flex-1 py-3.5 text-[10px] font-black text-white uppercase tracking-widest bg-primary rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95">Send SMS</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Link Parent Modal */}
      <AnimatePresence>
        {studentToLink && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setStudentToLink(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto">
                  <Link2 className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Link Parent Account</h3>
                  <p className="text-sm text-slate-500 font-medium">Connecting parent for <b>{studentToLink.name}</b></p>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search Parent (Name or Phone)</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="e.g., +251 9..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                </div>
                {parents.slice(0, 3).map((parent) => (
                  <div key={parent.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                        <Users className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 uppercase">{parent.name}</p>
                        <p className="text-[10px] text-slate-500">{parent.phone}</p>
                      </div>
                    </div>
                    <button onClick={() => setStudentToLink(null)}
                      className="px-3 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm active:scale-95 transition-all">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => setStudentToLink(null)}
                className="w-full mt-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">
                Maybe Later
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Student Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-sm">
                    <UserPlus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Manual Registration</h3>
                    <p className="text-xs text-slate-500 font-bold">Register a student into the system</p>
                  </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">First Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John"
                      value={newStudentForm.firstName}
                      onChange={(e) => setNewStudentForm((current) => ({ ...current, firstName: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Doe"
                      value={newStudentForm.lastName}
                      onChange={(e) => setNewStudentForm((current) => ({ ...current, lastName: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Roll No</label>
                    <input
                      type="text"
                      placeholder="ST-2025-..."
                      value={newStudentForm.rollNo}
                      onChange={(e) => setNewStudentForm((current) => ({ ...current, rollNo: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Gender</label>
                    <select
                      value={newStudentForm.gender}
                      onChange={(e) => setNewStudentForm((current) => ({ ...current, gender: e.target.value as StudentGender }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Grade</label>
                    <select
                      value={newStudentForm.gradeId}
                      onChange={(e) =>
                        setNewStudentForm((current) => ({
                          ...current,
                          gradeId: e.target.value,
                          sectionId: '',
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">Select grade</option>
                      {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Section</label>
                    <select
                      value={newStudentForm.sectionId}
                      onChange={(e) => setNewStudentForm((current) => ({ ...current, sectionId: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">Select section</option>
                      {sectionsForSelectedGrade.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</label>
                    <select
                      value={newStudentForm.status}
                      onChange={(e) => setNewStudentForm((current) => ({ ...current, status: e.target.value as StudentStatus }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="ACTIVE">Registered</option>
                      <option value="INACTIVE">Pending</option>
                      <option value="WITHDRAWN">Withdrawn</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Date of Birth</label>
                    <input
                      type="date"
                      value={newStudentForm.dateOfBirth}
                      onChange={(e) => setNewStudentForm((current) => ({ ...current, dateOfBirth: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Admission Date</label>
                    <input
                      type="date"
                      value={newStudentForm.admissionDate}
                      onChange={(e) => setNewStudentForm((current) => ({ ...current, admissionDate: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
                {studentFormError && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {studentFormError}
                  </div>
                )}
              </div>
              <div className="p-8 border-t border-slate-100 flex items-center justify-end gap-4">
                <button onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Cancel</button>
                <button
                  disabled={
                    isSubmittingStudent ||
                    !branchId ||
                    !organizationId ||
                    !newStudentForm.firstName ||
                    !newStudentForm.lastName ||
                    !newStudentForm.rollNo ||
                    !newStudentForm.sectionId ||
                    !newStudentForm.dateOfBirth ||
                    !newStudentForm.admissionDate
                  }
                  onClick={async () => {
                    if (!branchId || !organizationId) {
                      setStudentFormError('Branch and organization context are required.');
                      return;
                    }
                    setIsSubmittingStudent(true);
                    setStudentFormError(null);
                    try {
                      await studentsApi.create({
                        organization: organizationId,
                        branch: branchId,
                        first_name: newStudentForm.firstName.trim(),
                        last_name: newStudentForm.lastName.trim(),
                        gender: newStudentForm.gender,
                        date_of_birth: newStudentForm.dateOfBirth,
                        roll_no: newStudentForm.rollNo.trim(),
                        current_section: newStudentForm.sectionId,
                        admission_date: newStudentForm.admissionDate,
                        status: newStudentForm.status,
                      });
                      setIsAddModalOpen(false);
                      resetStudentForm();
                      refetchStudents();
                    } catch (error) {
                      setStudentFormError(
                        error instanceof Error ? error.message : 'Failed to register student.',
                      );
                    } finally {
                      setIsSubmittingStudent(false);
                    }
                  }}
                  className="bg-primary text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingStudent ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsImportModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-10 text-center space-y-6">
              <div className="w-20 h-20 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto shadow-sm">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Student Import</h3>
                <p className="text-sm text-slate-500 font-medium">Upload Excel or CSV file to import student directory</p>
              </div>
              <label className="block">
                <div className="mt-4 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 hover:border-primary/50 hover:bg-primary/[0.02] transition-all cursor-pointer group">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <ArrowUpDown className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 tracking-tight">Click or drag file to upload</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">.xlsx, .csv supported</p>
                    </div>
                  </div>
                </div>
                <input type="file" className="hidden" onChange={() => setIsImportModalOpen(false)} />
              </label>
              <div className="pt-4 flex items-center justify-center gap-6">
                <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Download Template</button>
                <div className="h-4 w-px bg-slate-100" />
                <button onClick={() => setIsImportModalOpen(false)}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
