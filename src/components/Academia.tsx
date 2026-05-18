
import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  ChevronDown, 
  Users, 
  GraduationCap, 
  Search,
  Book,
  Layers,
  ArrowRight,
  AlertCircle,
  X,
  Check,
  ChevronRight,
  MoreVertical,
  Settings,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Grade, Section, Subject, Assignment, Teacher } from '../types';
import { mockGrades, mockSections, mockSubjects, mockTeachers, mockAssignments } from '../constants/mockData';

const getPrimarySubject = (teacher: Teacher) => teacher.subjects[0] || 'Unassigned';

export const Academia: React.FC<{ academicYear: string }> = ({ academicYear }) => {
  const [activeTab, setActiveTab] = useState<'sections' | 'subjects' | 'roles'>('sections');
  const [grades, setGrades] = useState<Grade[]>(mockGrades);
  const [sections, setSections] = useState<Section[]>(mockSections);
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [sectionSubjectLinks, setSectionSubjectLinks] = useState<Record<string, string[]>>({});
  
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [activeSidebarSectionId, setActiveSidebarSectionId] = useState<string | null>(null);
  const [activeSidebarSubjectId, setActiveSidebarSubjectId] = useState<string | null>(null);
  const [activeSidebarTeacherId, setActiveSidebarTeacherId] = useState<string | null>(null);

  const [subjectFilterGradeId, setSubjectFilterGradeId] = useState<string | 'all'>('all');

  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [selectedGradeForNewSection, setSelectedGradeForNewSection] = useState<Grade | null>(null);

  const activeSection = useMemo(() => 
    sections.find(s => s.id === activeSidebarSectionId),
    [sections, activeSidebarSectionId]
  );
  
  const activeGrade = useMemo(() => 
    grades.find(g => g.id === activeSection?.gradeId),
    [grades, activeSection]
  );

  const activeSubject = useMemo(() => 
    subjects.find(s => s.id === activeSidebarSubjectId),
    [subjects, activeSidebarSubjectId]
  );

  const activeTeacher = useMemo(() => 
    mockTeachers.find(t => t.id === activeSidebarTeacherId),
    [activeSidebarTeacherId]
  );

  const stats = [
    { label: 'Grade Levels', value: grades.length, icon: Layers },
    { label: 'Total Sections', value: sections.length, icon: Users },
    { label: 'Total Subjects', value: subjects.length, icon: Book },
    { label: 'Unassigned Sections', value: sections.filter(s => !s.homeroomTeacherId).length, icon: AlertCircle, color: 'text-red-500' },
  ];

  return (
    <div className="min-h-full bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-6 sticky top-0 z-40 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-xl shadow-md">
              Academic year {academicYear}
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowAddGradeModal(true)}
               className="p-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center lg:px-4 gap-2"
               title="New Grade"
             >
               <Plus className="w-4 h-4" />
               <span className="hidden lg:inline">New Grade</span>
             </button>
             <button 
               onClick={() => setShowSubjectModal(true)}
               className="p-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center lg:px-4 gap-2"
               title="New Subject"
             >
               <Book className="w-4 h-4" />
               <span className="hidden lg:inline">New Subject</span>
             </button>
             <button 
               onClick={() => setShowAssignmentModal(true)}
               className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
             >
               <Plus className="w-4 h-4" />
               Assign Teacher
             </button>
          </div>
        </div>

        {/* Integrated Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-3 hover:bg-white hover:shadow-md transition-all group">
              <div className={`w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center ${stat.color || 'text-slate-400'} shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-black text-slate-900 leading-none">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100 w-fit">
          {[
            { id: 'sections', label: 'Sections', icon: Users },
            { id: 'subjects', label: 'Subjects', icon: Book },
            { id: 'roles', label: 'Roles', icon: GraduationCap },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-primary shadow-sm border border-slate-100' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'sections' && (
            <motion.div
              key="sections"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {grades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Layers className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">No Grade Levels Yet</h3>
                  <p className="text-sm font-medium text-slate-400 mt-2 mb-8 text-center max-w-xs">
                    Start by setting up your school's grade levels to begin organizing sections and students.
                  </p>
                  <button 
                    onClick={() => setShowAddGradeModal(true)}
                    className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Initialize First Grade
                  </button>
                </div>
              ) : (
                <>
                  {grades.map((grade, idx) => (
                    <div 
                      key={grade.id} 
                      className={`p-4 md:p-6 rounded-2xl space-y-4 border border-slate-100 transition-all ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-primary/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${idx % 2 === 0 ? 'bg-primary/10 text-primary' : 'bg-white text-primary shadow-sm'}`}>
                           {grade.name.includes(' ') ? grade.name.split(' ')[1] : grade.name[0]}
                        </div>
                        <h2 className="text-sm font-black text-slate-800 tracking-tight uppercase tracking-widest">{grade.name}</h2>
                        <div className="h-px flex-1 bg-slate-100/50" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {sections.filter(s => s.gradeId === grade.id).length} Sections
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {sections.filter(s => s.gradeId === grade.id).map(section => {
                          const ht = mockTeachers.find(t => t.id === section.homeroomTeacherId);
                          const linkedSubjects = subjects.filter(s => 
                            s.applicableGrades.includes(grade.name) || 
                            (sectionSubjectLinks[section.id] || []).includes(s.id)
                          );
                          const subjectCount = linkedSubjects.length;

                          return (
                            <motion.div 
                              key={section.id} 
                              onClick={() => setActiveSidebarSectionId(section.id)}
                              whileHover={{ y: -2 }}
                              className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-primary/40 transition-all group hover:shadow-xl hover:shadow-primary/5 cursor-pointer relative overflow-hidden flex flex-col justify-between h-full min-h-[140px]"
                            >
                              <div className="relative z-10">
                                <div className="flex justify-between items-start mb-3">
                                   <div className="flex flex-col">
                                     <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Section</span>
                                     <h3 className="text-2xl font-black text-slate-900 leading-none">{section.name}</h3>
                                   </div>
                                   <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-100/50">
                                     <Users className="w-3 h-3 text-slate-400" />
                                     <span className="text-[10px] font-bold text-slate-600">{section.studentCount}</span>
                                   </div>
                                </div>
                                
                                <div className="space-y-2.5">
                                   <div className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${ht ? 'bg-emerald-50/30 border-emerald-100/50' : 'bg-red-50/30 border-red-100/50'}`}>
                                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm ${ht ? 'bg-white text-emerald-600' : 'bg-white text-red-500'}`}>
                                        {ht ? ht.name?.[0] : '?'}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-[10px] font-bold truncate ${ht ? 'text-slate-700' : 'text-red-400 italic'}`}>
                                          {ht ? ht.name : 'No Homeroom'}
                                        </p>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">HT Lead</p>
                                      </div>
                                   </div>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between relative z-10">
                                 <div className="flex items-center gap-1.5">
                                    <BookOpen className="w-3 h-3 text-primary/40" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{subjectCount} Subjects</span>
                                 </div>
                                 <ArrowRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                              </div>

                              {/* Decorative Background Element */}
                              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                            </motion.div>
                          )
                        })}
                        <button 
                          onClick={() => {
                            setSelectedGradeForNewSection(grade);
                            setShowAddSectionModal(true);
                          }}
                          className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-white transition-all group h-full min-h-[140px]"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 group-hover:text-primary uppercase tracking-widest">Add Section</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-start pt-4">
                    <button 
                      onClick={() => setShowAddGradeModal(true)}
                      className="px-6 py-3.5 bg-primary text-white rounded-2xl flex items-center gap-3 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 group"
                    >
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">Add Grade Level</span>
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'subjects' && (
            <motion.div
              key="subjects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Filter Row */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                <button 
                  onClick={() => setSubjectFilterGradeId('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                    subjectFilterGradeId === 'all' 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  All Grades
                </button>
                {grades.map(grade => (
                  <button 
                    key={grade.id}
                    onClick={() => setSubjectFilterGradeId(grade.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                      subjectFilterGradeId === grade.id 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {grade.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects
                  .filter(subject => {
                    if (subjectFilterGradeId === 'all') return true;
                    const gradeName = grades.find(g => g.id === subjectFilterGradeId)?.name;
                    return subject.applicableGrades.includes(gradeName || '');
                  })
                  .map(subject => (
                  <motion.div 
                    key={subject.id} 
                    layoutId={`subject-${subject.id}`}
                    onClick={() => setActiveSidebarSubjectId(subject.id)}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-primary/30 transition-all flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-2xl hover:shadow-primary/5 min-h-[160px] relative overflow-hidden"
                  >
                    {/* Decorative Background Icon */}
                    <Book className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150 rotate-12" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
                          <Book className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subject.code}</span>
                           <div className="h-1 w-8 bg-primary/20 rounded-full mt-1 group-hover:w-12 transition-all duration-500" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-base font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">
                          {subject.nameEn}
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {assignments.filter(a => a.subjectId === subject.id).map(a => {
                            const teacher = mockTeachers.find(t => t.id === a.teacherId);
                            const section = sections.find(s => s.id === a.sectionId);
                            if (!teacher) return null;
                            return (
                              <div 
                                key={a.id} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSidebarTeacherId(teacher.id);
                                }}
                                className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-full text-[8px] font-bold text-slate-500 group-hover:border-primary/20 transition-all cursor-pointer hover:bg-slate-100"
                              >
                                <span className="text-primary/70">{section?.name}</span>
                                <span>{teacher.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex gap-1">
                          {subject.applicableGrades.slice(0, 3).map(g => (
                            <span key={g} className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg border border-transparent group-hover:border-primary/10 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                              {g.replace('Grade ', '')}
                            </span>
                          ))}
                          {subject.applicableGrades.length > 3 && (
                            <span className="text-[9px] font-black bg-slate-50 text-slate-400 px-2 py-1 rounded-lg">
                              +{subject.applicableGrades.length - 3}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 p-1 px-2 bg-slate-50 rounded-full group-hover:bg-primary/10 transition-colors">
                           <Users className="w-3 h-3 text-slate-400 group-hover:text-primary" />
                           <span className="text-[10px] font-black text-slate-600 group-hover:text-primary">{assignments.filter(a => a.subjectId === subject.id).length}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'roles' && (
             <motion.div
               key="roles"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-200"
             >
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <th className="px-6 py-4">Teacher</th>
                     <th className="px-6 py-4">Section</th>
                     <th className="px-6 py-4">Subject</th>
                     <th className="px-6 py-4">Role</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {assignments.map(ass => {
                     const teacher = mockTeachers.find(t => t.id === ass.teacherId);
                     const section = sections.find(s => s.id === ass.sectionId);
                     const subject = subjects.find(s => s.id === ass.subjectId);
                     const grade = grades.find(g => g.id === section?.gradeId);
                     
                     return (
                        <tr 
                          key={ass.id} 
                          onClick={() => setActiveSidebarTeacherId(teacher?.id || null)}
                          className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                        >
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                {teacher?.name?.[0]}
                              </div>
                              <span className="text-sm font-bold text-slate-700">{teacher?.name}</span>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-xs font-bold text-slate-600">{grade?.name} {section?.name}</span>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-xs font-bold text-slate-600">{subject?.nameEn}</span>
                         </td>
                         <td className="px-6 py-4">
                            {ass.isHomeroom ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-100 rounded-lg uppercase tracking-wider">Homeroom</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold border border-slate-200 rounded-lg uppercase tracking-wider">Subject Staff</span>
                            )}
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-300 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                         </td>
                       </tr>
                     )
                   })}
                 </tbody>
               </table>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAssignmentModal && (
          <TeacherAssignmentModal 
            onClose={() => {
              setShowAssignmentModal(false);
              setSelectedSectionId(null);
            }}
            teachers={mockTeachers as Teacher[]}
            subjects={subjects}
            sections={sections}
            grades={grades}
            initialSectionId={selectedSectionId}
            onSave={(ass) => {
              setAssignments(prev => [...prev, { ...ass, id: Math.random().toString(36).substr(2, 9) }]);
              
              // If it's a homeroom assignment, update the section
              if (ass.isHomeroom) {
                setSections(prev => prev.map(s => 
                  s.id === ass.sectionId ? { ...s, homeroomTeacherId: ass.teacherId } : s
                ));
              }
              
              setShowAssignmentModal(false);
              setSelectedSectionId(null);
            }}
          />
        )}
        
        {showSubjectModal && (
          <NewSubjectModal 
            onClose={() => setShowSubjectModal(false)}
            grades={grades}
            onSave={(newSubject) => {
              setSubjects(prev => [...prev, { ...newSubject, id: `s${prev.length + 1}` }]);
              setShowSubjectModal(false);
            }}
          />
        )}

        {activeSidebarSectionId && activeSection && (
          <SectionSidebar 
            section={activeSection}
            grade={activeGrade!}
            onClose={() => setActiveSidebarSectionId(null)}
            teachers={mockTeachers as Teacher[]}
            subjects={subjects}
            assignments={assignments}
            onTeacherClick={(teacherId) => setActiveSidebarTeacherId(teacherId)}
            onUnassign={(assignmentId) => {
              setAssignments(prev => prev.filter(a => a.id !== assignmentId));
            }}
            onUnassignHomeroom={() => {
              setSections(prev => prev.map(s => s.id === activeSidebarSectionId ? { ...s, homeroomTeacherId: undefined } : s));
              // Also remove the homeroom assignment from the assignments list
              setAssignments(prev => prev.filter(a => a.sectionId === activeSidebarSectionId && !a.isHomeroom));
            }}
            onUpdateAssignment={(teacherId, subjectId, isHomeroom) => {
               // Remove existing assignment for this section/subject combination if it exists
               setAssignments(prev => {
                 const filtered = prev.filter(a => !(a.sectionId === activeSidebarSectionId && a.subjectId === subjectId));
                 const newAss: Assignment = {
                   id: Math.random().toString(36).substr(2, 9),
                   teacherId,
                   subjectId,
                   sectionId: activeSidebarSectionId!,
                   isHomeroom,
                   academicYear
                 };
                 return [...filtered, newAss];
               });

               if (isHomeroom) {
                 setSections(prev => prev.map(s => s.id === activeSidebarSectionId ? { ...s, homeroomTeacherId: teacherId } : s));
               }
            }}
            linkedSubjectIds={sectionSubjectLinks[activeSection.id] || []}
            onLinkSubject={(subjectId) => {
              setSectionSubjectLinks(prev => ({
                ...prev,
                [activeSection.id]: [...(prev[activeSection.id] || []), subjectId]
              }));
            }}
            academicYear={academicYear}
          />
        )}

        {activeSidebarSubjectId && activeSubject && (
          <SubjectSidebar 
            subject={activeSubject}
            onClose={() => setActiveSidebarSubjectId(null)}
            assignments={assignments}
            teachers={mockTeachers as Teacher[]}
            sections={sections}
            grades={grades}
            academicYear={academicYear}
            onTeacherClick={(teacherId) => setActiveSidebarTeacherId(teacherId)}
            onAssignTeacher={(teacherId, sectionId, subjectId) => {
              const newAss: Assignment = {
                id: Math.random().toString(36).substr(2, 9),
                teacherId,
                sectionId,
                subjectId,
                isHomeroom: false,
                academicYear: 'AY 2024-25'
              };
              setAssignments(prev => [...prev, newAss]);
            }}
            onUnassignTeacher={(assignmentId) => {
              setAssignments(prev => prev.filter(a => a.id !== assignmentId));
            }}
          />
        )}

        {showAddGradeModal && (
          <NewGradeModal 
            onClose={() => setShowAddGradeModal(false)}
            onSave={(name, sectionNames) => {
              const gradeId = `g${Date.now()}`;
              setGrades(prev => [...prev, { id: gradeId, name }]);
              
              if (sectionNames.length > 0) {
                const newSections: Section[] = sectionNames.map(sName => ({
                  id: Math.random().toString(36).substr(2, 9),
                  name: sName.trim().toUpperCase(),
                  gradeId: gradeId,
                  studentCount: 40,
                  homeroomTeacherId: undefined
                }));
                setSections(prev => [...prev, ...newSections]);
              }
              
              setShowAddGradeModal(false);
            }}
          />
        )}

        {showAddSectionModal && selectedGradeForNewSection && (
          <NewSectionModal 
            grade={selectedGradeForNewSection}
            onClose={() => {
              setShowAddSectionModal(false);
              setSelectedGradeForNewSection(null);
            }}
            onSave={(newSection) => {
              setSections(prev => [...prev, { 
                ...newSection, 
                id: Math.random().toString(36).substr(2, 9),
                gradeId: selectedGradeForNewSection.id
              }]);
              setShowAddSectionModal(false);
              setSelectedGradeForNewSection(null);
            }}
          />
        )}

        {activeSidebarTeacherId && activeTeacher && (
          <TeacherSidebar 
            teacher={activeTeacher}
            onClose={() => setActiveSidebarTeacherId(null)}
            assignments={assignments}
            subjects={subjects}
            sections={sections}
            grades={grades}
            academicYear={academicYear}
            onAssignToTeacher={(sectionId, subjectId, isHomeroom) => {
              const newAss: Assignment = {
                id: Math.random().toString(36).substr(2, 9),
                teacherId: activeSidebarTeacherId!,
                sectionId,
                subjectId,
                isHomeroom,
                academicYear
              };
              setAssignments(prev => [...prev, newAss]);
              
              if (isHomeroom) {
                setSections(prev => prev.map(s => s.id === sectionId ? { ...s, homeroomTeacherId: activeSidebarTeacherId! } : s));
              }
            }}
            onUnassignFromTeacher={(assignmentId) => {
              const ass = assignments.find(a => a.id === assignmentId);
              if (ass?.isHomeroom) {
                setSections(prev => prev.map(s => s.id === ass.sectionId ? { ...s, homeroomTeacherId: undefined } : s));
              }
              setAssignments(prev => prev.filter(a => a.id !== assignmentId));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface TeacherAssignmentModalProps {
  onClose: () => void;
  teachers: Teacher[];
  subjects: Subject[];
  sections: Section[];
  grades: Grade[];
  initialSectionId?: string | null;
  onSave: (ass: any) => void;
}

const TeacherAssignmentModal: React.FC<TeacherAssignmentModalProps> = ({ 
  onClose, 
  teachers, 
  subjects, 
  sections, 
  grades,
  initialSectionId,
  onSave 
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(initialSectionId || '');
  const [isHomeroom, setIsHomeroom] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());

  const toggleGrade = (gradeId: string) => {
    const next = new Set(expandedGrades);
    if (next.has(gradeId)) next.delete(gradeId);
    else next.add(gradeId);
    setExpandedGrades(next);
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Assign Teacher</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[80vh] overflow-y-auto no-scrollbar">
          <div className="space-y-6">
            {/* Teacher Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Teacher</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Type teacher name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
              <div className="max-h-[250px] overflow-y-auto border border-slate-100 rounded-xl no-scrollbar divide-y divide-slate-50 mt-2">
                {filteredTeachers.map(t => {
                  const teacherData = (mockTeachers as any[]).find(mt => mt.id === t.id);
                  const workload = teacherData?.workload || 0;
                  const workloadColor = workload > 5 ? 'bg-red-500' : workload > 3 ? 'bg-amber-500' : 'bg-green-500';

                  return (
                    <button 
                      key={t.id}
                      onClick={() => setSelectedTeacherId(t.id)}
                      className={`w-full px-4 py-3 text-left transition-all ${
                        selectedTeacherId === t.id ? 'bg-primary/5' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                             {t.name?.[0]}
                           </div>
                           <span className={`text-xs ${selectedTeacherId === t.id ? 'font-black text-primary' : 'font-bold text-slate-700'}`}>
                             {t.name}
                           </span>
                        </div>
                        {selectedTeacherId === t.id && <Check className="w-3 h-3 text-primary" />}
                      </div>
                      
                      {/* Workload Meter */}
                      <div className="ml-11">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Workload</span>
                          <span className="text-[8px] font-bold text-slate-500">{workload}/6 Sections</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${workloadColor}`} 
                            style={{ width: `${(workload / 6) * 100}%` }} 
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link to Subject</label>
              <div className="grid grid-cols-2 gap-2">
                {subjects.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => setSelectedSubjectId(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedSubjectId === s.id 
                        ? 'bg-primary/5 border-primary ring-1 ring-primary' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <p className={`text-xs font-bold ${selectedSubjectId === s.id ? 'text-primary' : 'text-slate-700'}`}>{s.nameEn}</p>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">{s.code}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Section Selection Accordion */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Section</label>
              <div className="space-y-2 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
                {grades.map(g => (
                  <div key={g.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                    <button 
                      onClick={() => toggleGrade(g.id)}
                      className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-black text-slate-700">{g.name}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedGrades.has(g.id) ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {expandedGrades.has(g.id) && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 grid grid-cols-2 gap-2 border-t border-slate-100">
                            {sections.filter(s => s.gradeId === g.id).map(s => (
                              <button 
                                key={s.id}
                                onClick={() => setSelectedSectionId(s.id)}
                                className={`p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                                  selectedSectionId === s.id 
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                                    : 'bg-white border-slate-100 text-slate-600 hover:border-primary/20'
                                }`}
                              >
                                <span className="text-xs font-black">Section {s.name}</span>
                                <span className={`text-[9px] font-bold ${selectedSectionId === s.id ? 'text-primary-foreground/70' : 'text-slate-400'}`}>
                                  {s.studentCount} Students
                                </span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Homeroom Toggle */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-900 leading-none">Homeroom Privilege</p>
                <p className="text-[9px] text-emerald-600 mt-1 font-medium italic">Grants access to all parents in section</p>
              </div>
              <button 
                onClick={() => setIsHomeroom(!isHomeroom)}
                className={`w-10 h-5 rounded-full transition-all relative ${isHomeroom ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isHomeroom ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="pt-4">
               <button 
                 disabled={!selectedTeacherId || !selectedSubjectId || !selectedSectionId}
                 onClick={() => onSave({
                   teacherId: selectedTeacherId,
                   subjectId: selectedSubjectId,
                   sectionId: selectedSectionId,
                   isHomeroom,
                   academicYear: 'AY 2024-25'
                 })}
                 className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
                   !selectedTeacherId || !selectedSubjectId || !selectedSectionId
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-primary text-white shadow-primary/20 hover:shadow-primary/30 active:scale-95'
                 }`}
               >
                 Confirm Assignment
               </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface SubjectSidebarProps {
  subject: Subject;
  onClose: () => void;
  assignments: Assignment[];
  teachers: Teacher[];
  sections: Section[];
  grades: Grade[];
  onAssignTeacher: (teacherId: string, sectionId: string, subjectId: string) => void;
  onUnassignTeacher: (assignmentId: string) => void;
  academicYear: string;
  onTeacherClick: (teacherId: string) => void;
}

const SubjectSidebar: React.FC<SubjectSidebarProps> = ({ 
  subject, 
  onClose, 
  assignments, 
  teachers, 
  sections, 
  grades,
  onAssignTeacher,
  onUnassignTeacher,
  academicYear,
  onTeacherClick
}) => {
  const [selectedSectionForQuickLink, setSelectedSectionForQuickLink] = useState<Section | null>(null);
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [isAssigning, setIsAssigning] = useState<string | null>(null); // sectionId
  const [showAllGrades, setShowAllGrades] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  
  const subjectAssignments = assignments.filter(a => a.subjectId === subject.id);
  
  const instructors = useMemo(() => {
    const instructorIds = new Set(subjectAssignments.map(a => a.teacherId));
    return teachers.filter(t => instructorIds.has(t.id));
  }, [subjectAssignments, teachers]);

  const assignedSections = useMemo(() => {
    const sectionIds = new Set(subjectAssignments.map(a => a.sectionId));
    return sections.filter(s => sectionIds.has(s.id));
  }, [subjectAssignments, sections]);

  const filteredGrades = useMemo(() => {
    const applicable = grades.filter(g => subject.applicableGrades.includes(g.name));
    if (showAllGrades) return grades;
    return applicable;
  }, [grades, subject.applicableGrades, showAllGrades]);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
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
        className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col"
      >
        {/* Header - Aligned with Parents/Teachers Detail */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors group">
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg shadow-sm">
                {academicYear}
              </div>
              <button 
                onClick={() => setIsAddingTeacher(!isAddingTeacher)}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
              >
                {isAddingTeacher ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isAddingTeacher ? 'Cancel' : 'Link Instructor'}
              </button>
              <button 
                onClick={() => setActiveAction('Settings')}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10 shadow-inner">
               <Book className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-1">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">{subject.nameEn}</h2>
               <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 uppercase tracking-widest">
                    {subject.code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Registry Profile
                  </span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col lg:flex-row">
            {/* Left Column: Stats & Info (Sidebar) */}
            <div className="lg:w-64 lg:border-r border-slate-100 p-6 space-y-6 bg-slate-50/30 overflow-y-auto no-scrollbar">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacity Overview</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Instructors</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-900">{instructors.length}</span>
                      <span className="text-[10px] font-bold text-slate-400">Team</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Coverage</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-primary">{assignedSections.length}</span>
                      <span className="text-[10px] font-bold text-slate-400">Total</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-2 h-2 rounded-full ${assignedSections.length > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-xs font-black text-slate-700">Verified</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Actions</h3>
                <div className="flex flex-col gap-2">
                   <button 
                     onClick={() => setActiveAction('Syllabus')}
                     className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-[11px] font-bold hover:bg-slate-50 transition-colors text-left flex items-center justify-between group"
                   >
                     Update Syllabus <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                   <button 
                     onClick={() => setActiveAction('Resources')}
                     className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-[11px] font-bold hover:bg-slate-50 transition-colors text-left flex items-center justify-between group"
                   >
                     Resource Bank <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                </div>
              </section>
            </div>

            {/* Right Column: Dynamic Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-10">
              <section className="space-y-4">
                <AnimatePresence>
                  {isAddingTeacher && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-white border-2 border-primary/20 rounded-3xl p-5 shadow-xl shadow-primary/5 space-y-4 overflow-hidden mb-6"
                    >
                      {!selectedSectionForQuickLink ? (
                        <>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest px-1">Step 1: Select Section</p>
                          <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto no-scrollbar">
                            {sections
                              .filter(s => {
                                const grade = grades.find(g => g.id === s.gradeId);
                                return subject.applicableGrades.includes(grade?.name || '') && !subjectAssignments.some(a => a.sectionId === s.id);
                              })
                              .map(section => (
                                <button 
                                  key={section.id}
                                  onClick={() => setSelectedSectionForQuickLink(section)}
                                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-white border-2 border-transparent hover:border-primary/20 rounded-2xl transition-all group text-left"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-sm font-black text-slate-400 group-hover:text-primary transition-all shadow-sm">
                                      {section.name}
                                    </div>
                                    <div>
                                      <p className="text-xs font-black text-slate-700 group-hover:text-primary">{grades.find(g => g.id === section.gradeId)?.name} • Section {section.name}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase">{section.studentCount} Students</p>
                                    </div>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-primary transition-all translate-x-[-4px] group-hover:translate-x-0" />
                                </button>
                              ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-2 px-1">
                            <button onClick={() => setSelectedSectionForQuickLink(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                              <ArrowLeft className="w-4 h-4 text-slate-400" />
                            </button>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Step 2: Assign Instructor to {selectedSectionForQuickLink.name}</p>
                          </div>
                          <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto no-scrollbar">
                            {teachers.map(t => (
                              <button 
                                key={t.id}
                                onClick={() => {
                                  onAssignTeacher(t.id, selectedSectionForQuickLink.id, subject.id);
                                  setIsAddingTeacher(false);
                                  setSelectedSectionForQuickLink(null);
                                }}
                                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-white border-2 border-transparent hover:border-emerald-200 rounded-2xl transition-all group text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-sm font-black text-slate-400 group-hover:text-emerald-600 transition-all shadow-sm">
                                    {t.name?.[0]}
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-slate-700 group-hover:text-emerald-600">{t.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Primary: {getPrimarySubject(t)}</p>
                                  </div>
                                </div>
                                <Plus className="w-4 h-4 text-slate-200 group-hover:text-emerald-500 transition-all" />
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Taught by</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{instructors.length} Members</span>
                </div>
                
                <div className="space-y-4">
                  {instructors.map(teacher => {
                    const teacherAssignments = subjectAssignments.filter(a => a.teacherId === teacher.id);
                    return (
                      <div 
                        key={teacher.id} 
                        onClick={() => onTeacherClick(teacher.id)}
                        className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer hover:border-primary/20"
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-black text-primary group-hover:scale-105 transition-transform">
                            {teacher.name?.[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="text-base font-black text-slate-900 leading-tight">{teacher.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Primary Instructor</p>
                              </div>
                              <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-300 opacity-0 group-hover:opacity-100 transition-all">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {teacherAssignments.map(a => {
                                const section = sections.find(s => s.id === a.sectionId);
                                const grade = grades.find(g => g.id === section?.gradeId);
                                return (
                                  <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl group/pill hover:bg-white hover:border-red-200 transition-all shadow-sm">
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-slate-900 group-hover/pill:text-primary transition-colors">
                                        {grade?.name.replace('Grade ', 'G')}-{section?.name}
                                      </span>
                                    </div>
                                    <button 
                                      onClick={() => onUnassignTeacher(a.id)} 
                                      className="w-5 h-5 flex items-center justify-center bg-white rounded-lg border border-slate-100 opacity-0 group-hover/pill:opacity-100 transition-all hover:bg-red-50 hover:border-red-200 shadow-sm"
                                    >
                                      <X className="w-3 h-3 text-red-500" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        {/* Decorative element like in Parent Cards */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                      </div>
                    );
                  })}
                  
                  {instructors.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <Users className="w-8 h-8 text-slate-200" />
                       </div>
                       <h4 className="text-sm font-black text-slate-900 mb-1">No Faculty Linked</h4>
                       <p className="text-[11px] font-medium text-slate-400 italic">Assign teachers to sections for this subject</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">School Coverage</h3>
                  <button 
                    onClick={() => setShowAllGrades(!showAllGrades)}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    {showAllGrades ? 'Show Recommended Only' : 'Show All Grade Levels'}
                  </button>
                </div>
                
                <div className="space-y-6">
                  {filteredGrades.map(grade => {
                    const gradeSections = sections.filter(s => s.gradeId === grade.id);

                    return (
                      <div key={grade.id} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{grade.name}</span>
                          <div className="h-px flex-1 bg-slate-100" />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {gradeSections.map(section => {
                            const assignment = subjectAssignments.find(a => a.sectionId === section.id);
                            const teacher = teachers.find(t => t.id === assignment?.teacherId);
                            const isStaged = isAssigning === section.id;

                            return (
                              <div 
                                key={section.id} 
                                className={`p-4 rounded-2xl border transition-all ${
                                  teacher 
                                    ? 'bg-white border-slate-100' 
                                    : isStaged ? 'bg-white border-primary shadow-lg ring-4 ring-primary/5' : 'bg-white border-dashed border-slate-200'
                                }`}
                              >
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all shadow-inner ${
                                         teacher ? 'bg-emerald-50 text-emerald-600' : isStaged ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400 border border-slate-100'
                                       }`}>
                                          {section.name}
                                       </div>
                                       <div>
                                          <p className="text-sm font-black text-slate-900 mb-0.5">Section {section.name}</p>
                                          {teacher ? (
                                            <div className="flex items-center gap-1.5">
                                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                              <p className="text-[10px] font-bold text-slate-500 uppercase">Linked to {teacher.name}</p>
                                            </div>
                                          ) : (
                                            <p className="text-[10px] font-medium text-slate-300 italic">No instructor</p>
                                          )}
                                       </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      {teacher ? (
                                        <button 
                                          onClick={() => onUnassignTeacher(assignment!.id)}
                                          className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      ) : (
                                        <button 
                                          onClick={() => setIsAssigning(isStaged ? null : section.id)}
                                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border ${
                                            isStaged 
                                              ? 'bg-slate-900 text-white border-slate-900 font-mono' 
                                              : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5'
                                          }`}
                                        >
                                          {isStaged ? 'Cancel' : 'Link Staff'}
                                        </button>
                                      )}
                                    </div>
                                 </div>
                                 
                                 <AnimatePresence>
                                   {isStaged && (
                                     <motion.div 
                                       initial={{ height: 0, opacity: 0 }}
                                       animate={{ height: 'auto', opacity: 1 }}
                                       exit={{ height: 0, opacity: 0 }}
                                       className="mt-4 pt-4 border-t border-slate-100"
                                     >
                                       <div className="grid grid-cols-1 gap-1 max-h-[180px] overflow-y-auto no-scrollbar">
                                          {teachers.map(t => (
                                            <button 
                                              key={t.id}
                                              onClick={() => {
                                                onAssignTeacher(t.id, section.id, subject.id);
                                                setIsAssigning(null);
                                              }}
                                              className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-white hover:shadow-md hover:border-emerald-200 border border-transparent rounded-xl transition-all group"
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-primary transition-all">
                                                  {t.name?.[0]}
                                                </div>
                                                <span className="text-xs font-black text-slate-700 group-hover:text-primary transition-colors">{t.name}</span>
                                              </div>
                                              <Plus className="w-4 h-4 text-slate-200 group-hover:text-emerald-500 transition-all" />
                                            </button>
                                          ))}
                                       </div>
                                     </motion.div>
                                   )}
                                 </AnimatePresence>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Action Mini-Modal within Subject Sidebar */}
        <AnimatePresence>
          {activeAction && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-100 px-6 py-8 shadow-2xl rounded-t-3xl z-[110] text-center"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {activeAction === 'Syllabus' ? <Book className="w-6 h-6 text-primary" /> : activeAction === 'Resources' ? <Layers className="w-6 h-6 text-primary" /> : <Settings className="w-6 h-6 text-primary" />}
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">{activeAction} View</h4>
              <p className="text-sm text-slate-500 mb-6">This feature is coming soon to the {subject.nameEn} registry. Stay tuned for real-time updates.</p>
              <button 
                onClick={() => setActiveAction(null)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest"
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

interface SectionSidebarProps {
  section: Section;
  grade: Grade;
  onClose: () => void;
  teachers: Teacher[];
  subjects: Subject[];
  assignments: Assignment[];
  onUnassign: (assignmentId: string) => void;
  onUnassignHomeroom: () => void;
  onUpdateAssignment: (teacherId: string, subjectId: string, isHomeroom: boolean) => void;
  linkedSubjectIds: string[];
  onLinkSubject: (subjectId: string) => void;
  academicYear: string;
  onTeacherClick: (teacherId: string) => void;
}

const SectionSidebar: React.FC<SectionSidebarProps> = ({ 
  section, 
  grade, 
  onClose, 
  teachers, 
  subjects, 
  assignments,
  onUnassign,
  onUnassignHomeroom,
  onUpdateAssignment,
  linkedSubjectIds,
  onLinkSubject,
  academicYear,
  onTeacherClick
}) => {
  const [isAssigning, setIsAssigning] = useState<{ subjectId: string, isHomeroom: boolean } | null>(null);
  const [showLinkSubjectModal, setShowLinkSubjectModal] = useState(false);

  const sectionAssignments = assignments.filter(a => a.sectionId === section.id);
  const homeroomAssignment = sectionAssignments.find(a => a.isHomeroom);
  
  const relevantSubjects = useMemo(() => {
    const base = subjects.filter(s => s.applicableGrades.includes(grade.name));
    const additional = subjects.filter(s => 
      linkedSubjectIds.includes(s.id) || 
      sectionAssignments.some(a => a.subjectId === s.id)
    );
    
    const combined = [...base];
    additional.forEach(s => {
      if (!combined.some(c => c.id === s.id)) combined.push(s);
    });
    return combined;
  }, [subjects, grade.name, linkedSubjectIds, sectionAssignments]);

  const availableToLink = subjects.filter(s => !relevantSubjects.some(rs => rs.id === s.id));

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Sidebar Content */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col"
      >
        {/* Header - Aligned with Parents/Teachers Detail */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors group">
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg shadow-sm">
                {academicYear}
              </div>
              <button 
                onClick={() => setShowLinkSubjectModal(true)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-inner">
               <Users className="w-10 h-10" />
            </div>
            <div className="space-y-1">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">{grade.name} • {section.name}</h2>
               <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">
                    Section Profile
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Registry Details
                  </span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col lg:flex-row">
            {/* Left Column: Stats & Info (Sidebar) */}
            <div className="lg:w-64 lg:border-r border-slate-100 p-6 space-y-8 bg-slate-50/30 overflow-y-auto no-scrollbar">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment</h3>
                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">{section.studentCount}</span>
                    <span className="text-xs font-bold text-slate-400">capacity</span>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Homeroom Staff</h3>
                {homeroomAssignment ? (
                  <div className="space-y-3">
                    <div 
                      onClick={() => onTeacherClick(homeroomAssignment.teacherId)}
                      className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group cursor-pointer hover:border-primary/20 transition-all"
                    >
                       <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-black text-xs">
                             {teachers.find(t => t.id === homeroomAssignment.teacherId)?.name?.[0]}
                          </div>
                          <div>
                             <p className="text-xs font-black text-slate-800">{teachers.find(t => t.id === homeroomAssignment.teacherId)?.name}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lead Teacher</p>
                          </div>
                       </div>
                       <button 
                         onClick={onUnassignHomeroom}
                         className="w-full py-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                       >
                         Release Role
                       </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <button 
                      onClick={() => setIsAssigning({ subjectId: 'homeroom', isHomeroom: true })}
                      className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center hover:bg-white hover:border-primary/30 transition-all group"
                    >
                       <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2 text-slate-300 group-hover:text-primary transition-colors">
                          <Plus className="w-4 h-4" />
                       </div>
                       <span className="text-[10px] font-black text-slate-400 group-hover:text-primary uppercase tracking-widest transition-colors">Assign Lead</span>
                    </button>

                    <AnimatePresence>
                      {isAssigning?.isHomeroom && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60]"
                        >
                          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Faculty</span>
                            <button onClick={() => setIsAssigning(null)}>
                              <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                            </button>
                          </div>
                          <div className="max-h-[240px] overflow-y-auto no-scrollbar">
                            {teachers.length > 0 ? teachers.map(t => (
                              <button 
                                key={t.id}
                                onClick={() => {
                                  onUpdateAssignment(t.id, 'homeroom', true);
                                  setIsAssigning(null);
                                }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left"
                              >
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                  {t.name?.[0]}
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-[11px] font-black text-slate-700 truncate">{t.name}</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase truncate">{getPrimarySubject(t)}</p>
                                </div>
                              </button>
                            )) : (
                              <div className="p-4 text-center text-[10px] font-bold text-slate-400 italic">No faculty available</div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Dynamic Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Faculty Assignments</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sectionAssignments.length} Roles Active</span>
                </div>

                <div className="space-y-4">
                  {relevantSubjects.map(subject => {
                    const assignment = sectionAssignments.find(a => a.subjectId === subject.id);
                    const teacher = teachers.find(t => t.id === assignment?.teacherId);
                    const isStaged = isAssigning?.subjectId === subject.id;

                    return (
                      <div 
                        key={subject.id} 
                        onClick={() => teacher && onTeacherClick(teacher.id)}
                        className={`p-5 rounded-3xl border transition-all ${
                          teacher 
                            ? 'bg-white border-slate-100 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-primary/20' 
                            : isStaged ? 'bg-white border-primary shadow-xl ring-4 ring-primary/5' : 'bg-white border-dashed border-slate-200'
                        }`}
                      >
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-inner ${
                                 teacher ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : isStaged ? 'bg-primary text-white scale-110' : 'bg-slate-50 border border-slate-100 text-slate-400'
                               }`}>
                                  {subject.code}
                               </div>
                               <div>
                                  <h4 className="text-sm font-black text-slate-900 leading-tight">{subject.nameEn}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{subject.code}</span>
                                    {teacher ? (
                                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Assigned</span>
                                      </div>
                                    ) : (
                                      <span className="text-[9px] font-medium text-slate-300 italic">No instructor</span>
                                    )}
                                  </div>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {teacher ? (
                                <div className="flex items-center gap-3">
                                  <div className="text-right mr-3 hidden sm:block">
                                    <p className="text-xs font-black text-slate-700">{teacher.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Registry Profile</p>
                                  </div>
                                  <button 
                                    onClick={() => onUnassign(assignment!.id)}
                                    className="p-2.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setIsAssigning(isStaged ? null : { subjectId: subject.id, isHomeroom: false })}
                                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border ${
                                    isStaged 
                                      ? 'bg-slate-900 text-white border-slate-900' 
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary active:scale-95 px-5'
                                  }`}
                                >
                                  {isStaged ? 'Cancel' : 'Link Staff'}
                                </button>
                              )}
                            </div>
                         </div>
                         
                         <AnimatePresence>
                           {isStaged && (
                             <motion.div 
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: 'auto', opacity: 1 }}
                               exit={{ height: 0, opacity: 0 }}
                               className="mt-5 pt-5 border-t border-slate-100"
                             >
                               <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 px-1">Select instructor for {subject.nameEn}</p>
                               <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto no-scrollbar">
                                  {teachers.map(t => (
                                    <button 
                                      key={t.id}
                                      onClick={() => {
                                        onUpdateAssignment(t.id, subject.id, false);
                                        setIsAssigning(null);
                                      }}
                                      className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-white hover:shadow-lg hover:border-emerald-200 border border-transparent rounded-2xl transition-all group text-left"
                                    >
                                      <div className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-primary transition-all">
                                        {t.name?.[0]}
                                      </div>
                                      <div className="overflow-hidden">
                                        <p className="text-xs font-black text-slate-700 group-hover:text-primary truncate">{t.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase truncate">Primary: {getPrimarySubject(t)}</p>
                                      </div>
                                    </button>
                                  ))}
                               </div>
                             </motion.div>
                           )}
                         </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Selection Mini-Modal within Section Sidebar */}
        <AnimatePresence>
          {showLinkSubjectModal && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-100 px-6 py-6 shadow-2xl rounded-t-3xl z-[110]"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase tracking-widest">
                  Link Additional Subject
                </h4>
                <button onClick={() => setShowLinkSubjectModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="space-y-2 max-h-[250px] overflow-y-auto no-scrollbar pr-1">
                {availableToLink.length > 0 ? (
                  availableToLink.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => {
                        onLinkSubject(s.id);
                        setShowLinkSubjectModal(false);
                      }}
                      className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-white border-2 border-transparent hover:border-primary/20 rounded-2xl transition-all group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-sm font-black text-slate-400 group-hover:text-primary transition-all shadow-sm">
                          {s.code}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-700 group-hover:text-primary">{s.nameEn}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{s.code}</p>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-slate-200 group-hover:text-primary transition-all" />
                    </button>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 italic text-xs">
                    All subjects are already linked.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

interface TeacherSidebarProps {
  teacher: any; // Partial<Teacher> & { workload: number }
  onClose: () => void;
  assignments: Assignment[];
  subjects: Subject[];
  sections: Section[];
  grades: Grade[];
  onAssignToTeacher: (sectionId: string, subjectId: string, isHomeroom: boolean) => void;
  onUnassignFromTeacher: (assignmentId: string) => void;
  academicYear: string;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ 
  teacher, 
  onClose, 
  assignments, 
  subjects, 
  sections, 
  grades,
  onAssignToTeacher,
  onUnassignFromTeacher,
  academicYear
}) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isHomeroom, setIsHomeroom] = useState(false);

  const teacherAssignments = assignments.filter(a => a.teacherId === teacher.id);
  const teacherWorkload = teacher.workload || teacherAssignments.length;
  
  const assignedSubjects = useMemo(() => {
    const subjectIds = new Set(teacherAssignments.map(a => a.subjectId));
    return subjects.filter(s => subjectIds.has(s.id));
  }, [teacherAssignments, subjects]);

  const assignedSections = useMemo(() => {
    const sectionIds = new Set(teacherAssignments.map(a => a.sectionId));
    return sections.filter(s => sectionIds.has(s.id));
  }, [teacherAssignments, sections]);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
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
        className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors group">
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg shadow-sm">
                {academicYear}
              </div>
              <button 
                onClick={() => setIsAssigning(!isAssigning)}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
              >
                {isAssigning ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isAssigning ? 'Cancel' : 'New Assignment'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-inner">
               <span className="text-3xl font-black">{teacher.name?.[0]}</span>
            </div>
            <div className="space-y-1">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">{teacher.name}</h2>
               <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-widest">
                    {getPrimarySubject(teacher)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Faculty ID: #{teacher.id.padStart(4, '0')}
                  </span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col lg:flex-row">
            <div className="lg:w-64 lg:border-r border-slate-100 p-6 space-y-6 bg-slate-50/30 overflow-y-auto no-scrollbar">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Analytics</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Load</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-900">{teacherWorkload}</span>
                      <span className="text-[10px] font-bold text-slate-400">Sections</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Subjects</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-primary">{assignedSubjects.length}</span>
                      <span className="text-[10px] font-bold text-slate-400">Active</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Details</h3>
                <div className="space-y-2 text-[11px] font-bold text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase">Department</span>
                    <span>Academic Affairs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase">Status</span>
                    <span className="text-emerald-600">Full Time</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
              <AnimatePresence>
                {isAssigning && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-white border-2 border-primary/20 rounded-3xl p-6 shadow-xl shadow-primary/5 space-y-6 overflow-hidden mb-6"
                  >
                    <div className="space-y-4">
                      {/* Section Selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Select Target Section</label>
                        <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto no-scrollbar pr-1 pb-1">
                          {sections.map(section => {
                            const grade = grades.find(g => g.id === section.gradeId);
                            return (
                              <button 
                                key={section.id}
                                onClick={() => setSelectedSectionId(section.id)}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                  selectedSectionId === section.id 
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                    : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                                }`}
                              >
                                <p className="text-[10px] font-black uppercase">{grade?.name}</p>
                                <p className="text-xs font-bold">Section {section.name}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Subject Selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Select Subject</label>
                        <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto no-scrollbar pr-1 pb-1">
                          {subjects.map(subject => (
                            <button 
                              key={subject.id}
                              onClick={() => setSelectedSubjectId(subject.id)}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                selectedSubjectId === subject.id 
                                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                  : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                              }`}
                            >
                              <p className="text-[10px] font-black uppercase">{subject.code}</p>
                              <p className="text-xs font-bold leading-tight">{subject.nameEn}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Homeroom Toggle */}
                      <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Homeroom Lead?</span>
                        <button 
                          onClick={() => setIsHomeroom(!isHomeroom)}
                          className={`w-10 h-5 rounded-full transition-all relative ${isHomeroom ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isHomeroom ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>

                      <button 
                        disabled={!selectedSectionId || !selectedSubjectId}
                        onClick={() => {
                          onAssignToTeacher(selectedSectionId!, selectedSubjectId!, isHomeroom);
                          setIsAssigning(false);
                          setSelectedSectionId(null);
                          setSelectedSubjectId(null);
                          setIsHomeroom(false);
                        }}
                        className={`w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                          !selectedSectionId || !selectedSubjectId
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-primary text-white shadow-lg hover:shadow-xl active:scale-95'
                        }`}
                      >
                        Confirm Assignment
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Assignments</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{teacherAssignments.length} Roles</span>
                </div>

                <div className="space-y-4">
                  {teacherAssignments.map(assignment => {
                    const section = sections.find(s => s.id === assignment.sectionId);
                    const grade = grades.find(g => g.id === section?.gradeId);
                    const subject = subjects.find(s => s.id === assignment.subjectId);

                    return (
                      <div key={assignment.id} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-primary">
                            {subject?.code || '??'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-slate-900">{grade?.name} {section?.name}</h4>
                              {assignment.isHomeroom && (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded border border-emerald-100">Homeroom</span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-500 mt-0.5">{subject?.nameEn}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => onUnassignFromTeacher(assignment.id)}
                          className="p-2.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}

                  {teacherAssignments.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-200">
                         <Layers className="w-8 h-8" />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 mb-1">No Active Roles</h4>
                      <p className="text-[11px] font-medium text-slate-400 italic">This teacher hasn't been assigned to any sections yet</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface NewSectionModalProps {
  grade: Grade;
  onClose: () => void;
  onSave: (section: Omit<Section, 'id' | 'gradeId'>) => void;
}

const NewSectionModal: React.FC<NewSectionModalProps> = ({ grade, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    studentCount: 40
  });

  const isFormValid = formData.name.trim().length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">New Section</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">For {grade.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Section Name / Identifier</label>
              <input 
                type="text"
                placeholder="e.g., A, B, North, South"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black focus:ring-2 focus:ring-primary/10 transition-all tracking-widest"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Student Count</label>
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
                <Users className="w-5 h-5 text-slate-400" />
                <input 
                  type="number"
                  min="1"
                  max="100"
                  value={formData.studentCount}
                  onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value) || 0 })}
                  className="bg-transparent text-sm font-black w-full outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button 
            disabled={!isFormValid}
            onClick={() => onSave(formData)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
              isFormValid 
                ? 'bg-primary text-white shadow-primary/20 hover:shadow-primary/30 active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            Create Section
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface NewGradeModalProps {
  onClose: () => void;
  onSave: (name: string, sections: string[]) => void;
}

const NewGradeModal: React.FC<NewGradeModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [sections, setSections] = useState<string[]>([]);
  const [currentSection, setCurrentSection] = useState('');
  const isFormValid = name.trim().length > 0;

  const handleAddSection = () => {
    if (currentSection.trim() && !sections.includes(currentSection.trim().toUpperCase())) {
      setSections([...sections, currentSection.trim().toUpperCase()]);
      setCurrentSection('');
    }
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!isFormValid) return;
    onSave(name, sections);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Add Grade Level</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade Name</label>
            <input 
              type="text"
              autoFocus
              placeholder="e.g., Grade 9"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-lg font-black focus:ring-2 focus:ring-primary/10 transition-all tracking-tight"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Setup Sections (Optional)</label>
            
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Section name (e.g., A)"
                value={currentSection}
                onChange={(e) => setCurrentSection(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSection())}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none"
              />
              <button 
                onClick={handleAddSection}
                disabled={!currentSection.trim()}
                className="p-2.5 aspect-square bg-slate-100 text-slate-400 rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {sections.length > 0 ? (
                sections.map((s, idx) => (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={idx} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg border border-primary/10 group"
                  >
                    <span className="text-xs font-black">{s}</span>
                    <button onClick={() => removeSection(idx)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="w-full py-4 text-center border-2 border-dashed border-slate-50 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">No sections staged</p>
                </div>
              )}
            </div>
            
            <p className="text-[9px] font-medium text-slate-400 mt-1 italic">
              Tip: Type a name and press Enter to quickly add multiple sections.
            </p>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button 
            disabled={!isFormValid}
            onClick={handleSubmit}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-xl ${
              isFormValid 
                ? 'bg-primary text-white shadow-primary/20 hover:shadow-primary/30 active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            Confirm Grade
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};


interface NewSubjectModalProps {
  onClose: () => void;
  grades: Grade[];
  onSave: (subject: Omit<Subject, 'id'>) => void;
}

const NewSubjectModal: React.FC<NewSubjectModalProps> = ({ onClose, grades, onSave }) => {
  const [formData, setFormData] = useState({
    nameEn: '',
    code: '',
    applicableGrades: [] as string[]
  });

  const toggleGrade = (gradeName: string) => {
    setFormData(prev => ({
      ...prev,
      applicableGrades: prev.applicableGrades.includes(gradeName)
        ? prev.applicableGrades.filter(g => g !== gradeName)
        : [...prev.applicableGrades, gradeName]
    }));
  };

  const isFormValid = formData.nameEn && formData.code && formData.applicableGrades.length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Create Subject</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Name (English)</label>
              <input 
                type="text"
                placeholder="e.g., Mathematics"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Code</label>
              <input 
                type="text"
                placeholder="e.g., MATH-09"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black tracking-widest focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Applicable Grades</label>
            <div className="flex flex-wrap gap-2">
              {grades.map(g => (
                <button
                  key={g.id}
                  onClick={() => toggleGrade(g.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    formData.applicableGrades.includes(g.name)
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button 
            disabled={!isFormValid}
            onClick={() => onSave({ ...formData, nameAm: '' })}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
              isFormValid 
                ? 'bg-primary text-white shadow-primary/20 hover:shadow-primary/30 active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            Create Subject
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
