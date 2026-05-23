import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Book,
  BookOpen,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  academiaApi,
  ApiGrade,
  ApiHomeroomAssignment,
  ApiSection,
  ApiSubject,
  ApiTeacher,
  ApiTeacherAssignment,
  teachersApi,
} from '../lib/api';
import { useApiQuery } from '../hooks/useApiQuery';
import { useGrades } from '../hooks/useGrades';
import { useSections } from '../hooks/useSections';
import {
  useHomeroomAssignments,
  useTeacherAssignments,
  useTeachers,
} from '../hooks/useTeachers';

interface AcademiaProps {
  academicYearLabel: string;
  academicYearId: string | null;
  organizationId: string | null;
  branchId: string | null;
}

export const Academia: React.FC<AcademiaProps> = ({
  academicYearLabel,
  academicYearId,
  organizationId,
  branchId,
}) => {
  const [activeTab, setActiveTab] = useState<'sections' | 'subjects' | 'roles'>(
    'sections',
  );
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionGradeId, setSectionGradeId] = useState<string>('');
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [deleting, setDeleting] = useState<{
    type: 'grade' | 'section' | 'subject';
    id: string;
    label: string;
  } | null>(null);

  const {
    grades,
    isLoading: gradesLoading,
    error: gradesError,
    refetch: refetchGrades,
  } = useGrades(branchId);
  const {
    sections,
    isLoading: sectionsLoading,
    error: sectionsError,
    refetch: refetchSections,
  } = useSections(branchId, academicYearId);
  const {
    data: subjectsData,
    isLoading: subjectsLoading,
    error: subjectsError,
    refetch: refetchSubjects,
  } = useApiQuery<ApiSubject[]>(
    branchId ? () => academiaApi.getSubjects(branchId) : null,
    [branchId],
  );
  const {
    teachers,
    isLoading: teachersLoading,
    error: teachersError,
  } = useTeachers({ branchId, organizationId });
  const {
    assignments,
    isLoading: assignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useTeacherAssignments({ organizationId, academicYearId });
  const {
    homeroomAssignments,
    isLoading: homeroomLoading,
    error: homeroomError,
    refetch: refetchHomeroomAssignments,
  } = useHomeroomAssignments({ branchId, organizationId, academicYearId });

  const isLoading =
    gradesLoading ||
    sectionsLoading ||
    subjectsLoading ||
    teachersLoading ||
    assignmentsLoading ||
    homeroomLoading;
  const error =
    gradesError ||
    sectionsError ||
    subjectsError ||
    teachersError ||
    assignmentsError ||
    homeroomError;
  const subjects = subjectsData ?? [];

  const refreshAll = () => {
    refetchGrades();
    refetchSections();
    refetchSubjects();
    refetchAssignments();
    refetchHomeroomAssignments();
  };

  const openSectionModal = (gradeId = '') => {
    setSectionGradeId(gradeId);
    setShowSectionModal(true);
  };

  const sectionCards = useMemo(() => {
    return grades.map((grade) => ({
      grade,
      sections: sections
        .filter((section) => section.grade === grade.id)
        .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }))
        .map((section) => ({
          section,
          homeroomTeacherName:
            homeroomAssignments.find((assignment) => assignment.section === section.id)
              ?.teacher_name ?? 'No homeroom teacher assigned',
        })),
    }));
  }, [grades, homeroomAssignments, sections]);

  const roleRows = useMemo(() => {
    return sections
      .map((section) => {
        const grade = grades.find((item) => item.id === section.grade);
        const sectionAssignments = assignments.filter(
          (assignment) => assignment.section === section.id,
        );
        const homeroom = homeroomAssignments.find(
          (assignment) => assignment.section === section.id,
        );
        return {
          section,
          gradeName: grade?.name ?? 'Unknown Grade',
          homeroom,
          subjectAssignments: sectionAssignments,
        };
      })
      .sort((left, right) => {
        const gradeComparison = left.gradeName.localeCompare(right.gradeName, undefined, {
          numeric: true,
        });
        if (gradeComparison !== 0) return gradeComparison;
        return left.section.name.localeCompare(right.section.name, undefined, {
          numeric: true,
        });
      });
  }, [assignments, grades, homeroomAssignments, sections]);

  const stats = useMemo(
    () => ({
      grades: grades.length,
      sections: sections.length,
      subjects: subjects.length,
      homerooms: homeroomAssignments.length,
    }),
    [grades.length, homeroomAssignments.length, sections.length, subjects.length],
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Loading academia
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
          <p className="font-black text-red-700">Failed to load academia</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="sticky top-0 z-20 border-b border-slate-100 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary px-4 py-2 text-sm font-black text-white shadow-md">
                Academic year {academicYearLabel}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowGradeModal(true)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700"
              >
                New Grade
              </button>
              <button
                onClick={() => openSectionModal()}
                disabled={!academicYearId || grades.length === 0}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700"
              >
                New Section
              </button>
              <button
                onClick={() => setShowSubjectModal(true)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700"
              >
                New Subject
              </button>
              <button
                onClick={() => setShowRoleModal(true)}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-primary/20"
              >
                Assign Teacher
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Grades" value={stats.grades} icon={GraduationCap} />
            <StatCard label="Sections" value={stats.sections} icon={Users} />
            <StatCard label="Subjects" value={stats.subjects} icon={Book} />
            <StatCard label="Homerooms" value={stats.homerooms} icon={BookOpen} />
          </div>

          {!academicYearId && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              No academic year is available. Create or mark an academic year as current in the backend before adding sections or role assignments.
            </div>
          )}

          <div className="flex gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-1">
            {[
              { id: 'sections', label: 'Sections', icon: Users },
              { id: 'subjects', label: 'Subjects', icon: Book },
              { id: 'roles', label: 'Roles', icon: GraduationCap },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest ${
                  activeTab === tab.id
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {activeTab === 'sections' && (
          <div className="space-y-6">
            {sectionCards.map(({ grade, sections: gradeSections }) => (
              <section
                key={grade.id}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{grade.name}</h2>
                    <p className="text-xs text-slate-500">
                      {gradeSections.length} sections
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openSectionModal(grade.id)}
                      disabled={!academicYearId}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add Section
                    </button>
                    <button
                      onClick={() =>
                        setDeleting({
                          type: 'grade',
                          id: grade.id,
                          label: grade.name,
                        })
                      }
                      className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                    >
                      Delete Grade
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {gradeSections.map(({ section, homeroomTeacherName }) => (
                    <div
                      key={section.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            Section {section.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {homeroomTeacherName}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setDeleting({
                              type: 'section',
                              id: section.id,
                              label: `${grade.name} ${section.name}`,
                            })
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {gradeSections.length === 0 && (
                    <EmptyState message="No sections created for this grade." />
                  )}
                </div>
              </section>
            ))}
          </div>
        )}

        {activeTab === 'subjects' && (
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="space-y-3">
              {subjects.map((subject) => {
                const grade = grades.find((item) => item.id === subject.grade);
                return (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {subject.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {subject.code} • {grade?.name ?? 'Unknown Grade'}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setDeleting({
                          type: 'subject',
                          id: subject.id,
                          label: subject.name,
                        })
                      }
                      className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
              {subjects.length === 0 && (
                <EmptyState message="No subjects created yet." />
              )}
            </div>
          </section>
        )}

        {activeTab === 'roles' && (
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3">Homeroom</th>
                    <th className="px-4 py-3">Subject Assignments</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roleRows.map((row) => (
                    <tr key={row.section.id} className="border-b border-slate-50">
                      <td className="px-4 py-4">
                        <p className="text-sm font-black text-slate-900">
                          {row.gradeName} • Section {row.section.name}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {row.homeroom?.teacher_name ?? 'Unassigned'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {row.subjectAssignments.length > 0 ? (
                            row.subjectAssignments.map((assignment) => (
                              <span
                                key={assignment.id}
                                className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600"
                              >
                                {assignment.subject_name} - {assignment.teacher_name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400">No subject assignments</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => setShowRoleModal(true)}
                          className="rounded-xl bg-primary px-3 py-2 text-xs font-black text-white"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <AnimatePresence>
        {showGradeModal && branchId && organizationId && (
          <GradeModal
            branchId={branchId}
            organizationId={organizationId}
            existingCount={grades.length}
            onClose={() => setShowGradeModal(false)}
            onSuccess={() => {
              setShowGradeModal(false);
              refreshAll();
            }}
          />
        )}
        {showSectionModal && branchId && organizationId && academicYearId && (
          <SectionModal
            branchId={branchId}
            organizationId={organizationId}
            academicYearId={academicYearId}
            grades={grades}
            initialGradeId={sectionGradeId}
            onClose={() => setShowSectionModal(false)}
            onSuccess={() => {
              setShowSectionModal(false);
              setSectionGradeId('');
              refreshAll();
            }}
          />
        )}
        {showSubjectModal && branchId && organizationId && (
          <SubjectModal
            branchId={branchId}
            organizationId={organizationId}
            grades={grades}
            onClose={() => setShowSubjectModal(false)}
            onSuccess={() => {
              setShowSubjectModal(false);
              refreshAll();
            }}
          />
        )}
        {showRoleModal && organizationId && branchId && academicYearId && (
          <RoleAssignmentModal
            organizationId={organizationId}
            branchId={branchId}
            academicYearId={academicYearId}
            grades={grades}
            sections={sections}
            subjects={subjects}
            teachers={teachers}
            assignments={assignments}
            homeroomAssignments={homeroomAssignments}
            onClose={() => setShowRoleModal(false)}
            onSuccess={() => {
              setShowRoleModal(false);
              refreshAll();
            }}
          />
        )}
        {deleting && (
          <DeleteModal
            label={deleting.label}
            onClose={() => setDeleting(null)}
            onConfirm={async () => {
              if (deleting.type === 'grade') {
                await academiaApi.deleteGrade(deleting.id);
              } else if (deleting.type === 'section') {
                await academiaApi.deleteSection(deleting.id);
              } else {
                await academiaApi.deleteSubject(deleting.id);
              }
              setDeleting(null);
              refreshAll();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

function GradeModal({
  branchId,
  organizationId,
  existingCount,
  onClose,
  onSuccess,
}: {
  branchId: string;
  organizationId: string;
  existingCount: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <ModalFrame title="Create Grade" onClose={onClose}>
      <InputField label="Grade Name" value={name} onChange={setName} />
      <ModalActions
        onClose={onClose}
        disabled={!name || isSubmitting}
        onSubmit={async () => {
          setIsSubmitting(true);
          try {
            await academiaApi.createGrade({
              organization: organizationId,
              branch: branchId,
              name,
              level: parseInt(name.replace(/\D/g, ''), 10) || existingCount + 1,
            });
            onSuccess();
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </ModalFrame>
  );
}

function SectionModal({
  branchId,
  organizationId,
  academicYearId,
  grades,
  initialGradeId,
  onClose,
  onSuccess,
}: {
  branchId: string;
  organizationId: string;
  academicYearId: string;
  grades: ApiGrade[];
  initialGradeId?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [gradeId, setGradeId] = useState(initialGradeId ?? '');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <ModalFrame title="Create Section" onClose={onClose}>
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Grade
          </span>
          <select
            value={gradeId}
            onChange={(event) => setGradeId(event.target.value)}
            className="field"
          >
            <option value="">Select grade</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </label>
        <InputField label="Section Name" value={name} onChange={setName} />
      </div>
      <ModalActions
        onClose={onClose}
        disabled={!gradeId || !name || isSubmitting}
        onSubmit={async () => {
          setIsSubmitting(true);
          try {
            await academiaApi.createSection({
              organization: organizationId,
              branch: branchId,
              grade: gradeId,
              academic_year: academicYearId,
              name: name.toUpperCase(),
            });
            onSuccess();
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </ModalFrame>
  );
}

function SubjectModal({
  branchId,
  organizationId,
  grades,
  onClose,
  onSuccess,
}: {
  branchId: string;
  organizationId: string;
  grades: ApiGrade[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [gradeIds, setGradeIds] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <ModalFrame title="Create Subject" onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Grades
          </span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {grades.map((grade) => {
              const selected = gradeIds.includes(grade.id);
              return (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() =>
                    setGradeIds((current) =>
                      current.includes(grade.id)
                        ? current.filter((id) => id !== grade.id)
                        : [...current, grade.id],
                    )
                  }
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
                    selected
                      ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-primary/30 hover:bg-white'
                  }`}
                >
                  {grade.name}
                </button>
              );
            })}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Select one or more grades. The subject will be created for each selected grade.
        </p>
        <InputField label="Subject Name" value={name} onChange={setName} />
        <InputField label="Subject Code" value={code} onChange={setCode} />
      </div>
      <ModalActions
        onClose={onClose}
        disabled={gradeIds.length === 0 || !name || !code || isSubmitting}
        onSubmit={async () => {
          setIsSubmitting(true);
          try {
            for (const gradeId of gradeIds) {
              const subject = await academiaApi.createSubject({
                organization: organizationId,
                branch: branchId,
                grade: gradeId,
                name,
                code,
              });
              await academiaApi.linkGradeSubject(organizationId, gradeId, subject.id);
            }
            onSuccess();
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </ModalFrame>
  );
}

function RoleAssignmentModal({
  organizationId,
  branchId,
  academicYearId,
  grades,
  sections,
  subjects,
  teachers,
  assignments,
  homeroomAssignments,
  onClose,
  onSuccess,
}: {
  organizationId: string;
  branchId: string;
  academicYearId: string;
  grades: ApiGrade[];
  sections: ApiSection[];
  subjects: ApiSubject[];
  teachers: ApiTeacher[];
  assignments: ApiTeacherAssignment[];
  homeroomAssignments: ApiHomeroomAssignment[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [teacherId, setTeacherId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [isHomeroom, setIsHomeroom] = useState(false);
  const [mode, setMode] = useState<'create' | 'delete'>('create');
  const [existingAssignmentId, setExistingAssignmentId] = useState('');
  const [existingHomeroomId, setExistingHomeroomId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectionOptions = useMemo(
    () => buildSectionOptions(sections, grades),
    [sections, grades],
  );

  return (
    <ModalFrame title="Manage Teacher Roles" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-1">
          {(['create', 'delete'] as const).map((value) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`flex-1 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest ${
                mode === value ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
              }`}
            >
              {value === 'create' ? 'Create Assignment' : 'Remove Assignment'}
            </button>
          ))}
        </div>

        {mode === 'create' ? (
          <>
            <SelectField
              label="Teacher"
              value={teacherId}
              onChange={setTeacherId}
              options={teachers.map((teacher) => ({
                value: teacher.id,
                label: `${teacher.user_name} - ${teacher.employee_id}`,
              }))}
            />
            <SelectField
              label="Section"
              value={sectionId}
              onChange={setSectionId}
              options={sectionOptions}
            />
            <SelectField
              label="Subject"
              value={subjectId}
              onChange={setSubjectId}
              options={subjects.map((subject) => ({
                value: subject.id,
                label: `${subject.name} - ${subject.code}`,
              }))}
            />
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <input
                type="checkbox"
                checked={isHomeroom}
                onChange={(event) => setIsHomeroom(event.target.checked)}
              />
              <span className="text-sm font-bold text-slate-700">
                Also create homeroom assignment
              </span>
            </label>
          </>
        ) : (
          <>
            <SelectField
              label="Subject Assignment"
              value={existingAssignmentId}
              onChange={setExistingAssignmentId}
              options={assignments.map((assignment) => ({
                value: assignment.id,
                label: `${assignment.grade_name} ${assignment.section_name} - ${assignment.subject_name} - ${assignment.teacher_name}`,
              }))}
            />
            <SelectField
              label="Homeroom Assignment"
              value={existingHomeroomId}
              onChange={setExistingHomeroomId}
              options={homeroomAssignments.map((assignment) => ({
                value: assignment.id,
                label: `${assignment.grade_name} ${assignment.section_name} - ${assignment.teacher_name}`,
              }))}
            />
          </>
        )}
      </div>

      <ModalActions
        onClose={onClose}
        disabled={
          isSubmitting ||
          (mode === 'create'
            ? !teacherId || !sectionId || !subjectId
            : !existingAssignmentId && !existingHomeroomId)
        }
        submitLabel={mode === 'create' ? 'Save Role' : 'Remove Role'}
        onSubmit={async () => {
          setIsSubmitting(true);
          try {
            if (mode === 'create') {
              await teachersApi.createAssignment({
                teacher: teacherId,
                organization: organizationId,
                subject: subjectId,
                section: sectionId,
                academic_year: academicYearId,
              });
              if (isHomeroom) {
                await teachersApi.createHomeroomAssignment({
                  organization: organizationId,
                  branch: branchId,
                  academic_year: academicYearId,
                  section: sectionId,
                  teacher: teacherId,
                  notes: '',
                });
              }
            } else {
              if (existingAssignmentId) {
                await teachersApi.deleteAssignment(existingAssignmentId);
              }
              if (existingHomeroomId) {
                await teachersApi.deleteHomeroomAssignment(existingHomeroomId);
              }
            }
            onSuccess();
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </ModalFrame>
  );
}

function DeleteModal({
  label,
  onClose,
  onConfirm,
}: {
  label: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <ModalFrame title={`Delete ${label}?`} onClose={onClose}>
      <p className="text-sm text-slate-500">
        This action cannot be undone.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={async () => {
            setIsSubmitting(true);
            try {
              await onConfirm();
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white"
        >
          Delete
        </button>
      </div>
    </ModalFrame>
  );
}

function ModalFrame({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-50">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>
        <div className="space-y-5 p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function ModalActions({
  onClose,
  onSubmit,
  disabled,
  submitLabel = 'Save',
}: {
  onClose: () => void;
  onSubmit: () => Promise<void>;
  disabled: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onSubmit}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="field">
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function buildSectionOptions(
  sections: ApiSection[],
  grades: ApiGrade[],
): Array<{ value: string; label: string }> {
  return sections
    .map((section) => ({
      value: section.id,
      sectionName: section.name,
      gradeName: grades.find((grade) => grade.id === section.grade)?.name ?? 'Unknown Grade',
    }))
    .sort((left, right) => {
      const gradeComparison = left.gradeName.localeCompare(right.gradeName, undefined, {
        numeric: true,
      });
      if (gradeComparison !== 0) return gradeComparison;
      return left.sectionName.localeCompare(right.sectionName, undefined, {
        numeric: true,
      });
    })
    .map((section) => ({
      value: section.value,
      label: `${section.gradeName} - Section ${section.sectionName}`,
    }));
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field"
      />
    </label>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-primary shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}
