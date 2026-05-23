import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  FilePlus,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  academiaApi,
  ApiSubject,
  ApiTeacher,
  authApi,
  importApi,
  teachersApi,
} from '../lib/api';
import { useApiQuery } from '../hooks/useApiQuery';
import {
  useHomeroomAssignments,
  useTeacherAssignments,
  useTeachers,
} from '../hooks/useTeachers';
import { useSections } from '../hooks/useSections';

interface TeachersProps {
  academicYear?: string;
  branchId?: string | null;
  organizationId?: string | null;
  academicYearId?: string | null;
}

export const Teachers: React.FC<TeachersProps> = ({
  academicYear = 'Current Year',
  branchId,
  organizationId,
  academicYearId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const {
    teachers,
    isLoading: teachersLoading,
    error: teachersError,
    refetch: refetchTeachers,
  } = useTeachers({ branchId, organizationId, search: searchTerm || undefined });
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
  const {
    sections,
    isLoading: sectionsLoading,
    error: sectionsError,
  } = useSections(branchId ?? null, academicYearId);
  const {
    data: subjects = [],
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useApiQuery<ApiSubject[]>(
    branchId ? () => academiaApi.getSubjects(branchId) : null,
    [branchId],
  );

  const isLoading =
    teachersLoading ||
    assignmentsLoading ||
    homeroomLoading ||
    sectionsLoading ||
    subjectsLoading;
  const error =
    teachersError ||
    assignmentsError ||
    homeroomError ||
    sectionsError ||
    subjectsError;

  const teacherCards = useMemo(() => {
    return teachers.map((teacher) => {
      const teacherAssignments = assignments.filter(
        (assignment) => assignment.teacher === teacher.id,
      );
      const teacherHomerooms = homeroomAssignments.filter(
        (assignment) => assignment.teacher === teacher.id,
      );
      return {
        teacher,
        subjectNames: [
          ...new Set(
            teacherAssignments.map((assignment) => assignment.subject_name).filter(Boolean),
          ),
        ],
        sectionNames: [
          ...new Set(
            [
              ...teacherAssignments.map(
                (assignment) => `${assignment.grade_name} ${assignment.section_name}`,
              ),
              ...teacherHomerooms.map(
                (assignment) => `${assignment.grade_name} ${assignment.section_name}`,
              ),
            ].filter(Boolean),
          ),
        ],
        homeroomCount: teacherHomerooms.length,
      };
    });
  }, [assignments, homeroomAssignments, teachers]);

  const selectedTeacher = useMemo(
    () => teacherCards.find((entry) => entry.teacher.id === selectedTeacherId) ?? null,
    [selectedTeacherId, teacherCards],
  );

  const stats = useMemo(
    () => ({
      totalTeachers: teachers.length,
      withAssignments: teacherCards.filter((entry) => entry.sectionNames.length > 0)
        .length,
      homeroomLeads: homeroomAssignments.length,
      uniqueSubjects: new Set(
        assignments.map((assignment) => assignment.subject_name).filter(Boolean),
      ).size,
    }),
    [assignments, homeroomAssignments.length, teacherCards, teachers.length],
  );

  const refreshAll = () => {
    refetchTeachers();
    refetchAssignments();
    refetchHomeroomAssignments();
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Loading teachers
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
          <p className="font-black text-red-700">Failed to load teachers</p>
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
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Teachers
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Academic year {academicYear}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-4 py-2.5 text-sm font-bold text-primary"
              >
                <FilePlus className="h-4 w-4" />
                Bulk Import
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                Invite Teacher
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Teachers" value={stats.totalTeachers} icon={Users} />
            <StatCard
              label="With Assignments"
              value={stats.withAssignments}
              icon={ShieldCheck}
            />
            <StatCard
              label="Homeroom Leads"
              value={stats.homeroomLeads}
              icon={User}
            />
            <StatCard
              label="Subjects Covered"
              value={stats.uniqueSubjects}
              icon={BookOpen}
            />
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search teachers by name or employee ID"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5"
            />
          </div>
        </div>
      </div>

      <div className="grid flex-1 gap-6 overflow-hidden p-4 md:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] md:p-6">
        <section className="overflow-y-auto rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="space-y-3">
            {teacherCards.map((entry) => (
              <button
                key={entry.teacher.id}
                onClick={() => setSelectedTeacherId(entry.teacher.id)}
                className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                  selectedTeacherId === entry.teacher.id
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <TeacherAvatar name={entry.teacher.user_name} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-black text-slate-900">
                      {entry.teacher.user_name}
                    </p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-600">
                      {entry.teacher.employee_id}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{entry.teacher.user_email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.subjectNames.slice(0, 3).map((subject) => (
                      <Tag key={subject}>{subject}</Tag>
                    ))}
                    {entry.subjectNames.length === 0 && <Tag>No subject assignments</Tag>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">
                    {entry.sectionNames.length}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    sections
                  </p>
                </div>
              </button>
            ))}
            {teacherCards.length === 0 && (
              <EmptyState message="No teachers found for this branch yet." />
            )}
          </div>
        </section>

        <section className="overflow-y-auto rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          {selectedTeacher ? (
            <TeacherDetails entry={selectedTeacher} />
          ) : (
            <EmptyState message="Select a teacher to review assignments and contact details." />
          )}
        </section>
      </div>

      <AnimatePresence>
        {showInviteModal && branchId && organizationId && academicYearId && (
          <InviteTeacherModal
            branchId={branchId}
            organizationId={organizationId}
            academicYearId={academicYearId}
            sections={sections}
            subjects={subjects}
            onClose={() => setShowInviteModal(false)}
            onSuccess={() => {
              setShowInviteModal(false);
              refreshAll();
            }}
          />
        )}
        {showImportModal && branchId && organizationId && (
          <ImportTeachersModal
            branchId={branchId}
            organizationId={organizationId}
            onClose={() => setShowImportModal(false)}
            onSuccess={() => {
              setShowImportModal(false);
              refreshAll();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

function TeacherDetails({
  entry,
}: {
  entry: {
    teacher: ApiTeacher;
    subjectNames: string[];
    sectionNames: string[];
    homeroomCount: number;
  };
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <TeacherAvatar name={entry.teacher.user_name} large />
        <div>
          <h2 className="text-lg font-black text-slate-900">
            {entry.teacher.user_name}
          </h2>
          <p className="text-sm font-medium text-slate-500">
            {entry.teacher.employee_id}
          </p>
        </div>
      </div>

      <InfoRow icon={Mail} label="Email" value={entry.teacher.user_email} />
      <InfoRow icon={BookOpen} label="Specialization" value={entry.teacher.specialization || 'Not set'} />
      <InfoRow icon={ShieldCheck} label="Homeroom Assignments" value={String(entry.homeroomCount)} />
      <InfoRow
        icon={Phone}
        label="Joining Date"
        value={entry.teacher.joining_date || 'Not set'}
      />

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Subjects
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {entry.subjectNames.length > 0 ? (
            entry.subjectNames.map((subject) => <Tag key={subject}>{subject}</Tag>)
          ) : (
            <Tag>No subject assignments</Tag>
          )}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Sections
        </p>
        <div className="mt-3 space-y-2">
          {entry.sectionNames.length > 0 ? (
            entry.sectionNames.map((section) => (
              <div
                key={section}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
              >
                {section}
              </div>
            ))
          ) : (
            <EmptyState message="No section assignments yet." />
          )}
        </div>
      </div>
    </div>
  );
}

function generateTemporaryPassword() {
  return `Tmp!${Math.random().toString(36).slice(-10)}A1`;
}

function InviteTeacherModal({
  branchId,
  organizationId,
  academicYearId,
  sections,
  subjects,
  onClose,
  onSuccess,
}: {
  branchId: string;
  organizationId: string;
  academicYearId: string;
  sections: Array<{ id: string; name: string; grade: string }>;
  subjects: ApiSubject[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [grandfatherName, setGrandfatherName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isHomeroom, setIsHomeroom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sectionOptions = useMemo(
    () =>
      [...sections].sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true })),
    [sections],
  );

  return (
    <ModalFrame title="Invite Teacher" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          Required fields are marked below. Optional fields can be filled later.
        </div>
        <InputField label="Teacher Name (Required)" value={name} onChange={setName} />
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Father Name (Required)"
            value={fatherName}
            onChange={setFatherName}
          />
          <InputField
            label="Grandfather Name (Required)"
            value={grandfatherName}
            onChange={setGrandfatherName}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="Email (Required)" value={email} onChange={setEmail} />
          <InputField
            label="Phone Number (Required)"
            value={phone}
            onChange={setPhone}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Address (Required)"
            value={address}
            onChange={setAddress}
          />
          <InputField
            label="Employee ID (Required)"
            value={employeeId}
            onChange={setEmployeeId}
          />
        </div>
        <InputField
          label="Specialization (Optional)"
          value={specialization}
          onChange={setSpecialization}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Section Assignment (Optional)
            </span>
            <select
              value={selectedSectionId}
              onChange={(event) => setSelectedSectionId(event.target.value)}
              className="field"
            >
              <option value="">No section assignment</option>
              {sectionOptions.map((section) => (
                <option key={section.id} value={section.id}>
                  Section {section.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Subject Assignment (Optional)
            </span>
            <select
              value={selectedSubjectId}
              onChange={(event) => setSelectedSubjectId(event.target.value)}
              className="field"
            >
              <option value="">No subject assignment</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={isHomeroom}
            onChange={(event) => setIsHomeroom(event.target.checked)}
          />
          <span className="text-sm font-bold text-slate-700">
            Create homeroom assignment for the selected section
          </span>
        </label>
        <p className="text-xs text-slate-500">
          The password field has been removed from this form. The account is created with a temporary internal password until a dedicated teacher invitation endpoint exists.
        </p>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={
              isSubmitting ||
              !name ||
              !fatherName ||
              !grandfatherName ||
              !email ||
              !phone ||
              !address ||
              !employeeId
            }
            onClick={async () => {
              setIsSubmitting(true);
              setError(null);
              try {
                const user = await authApi.registerUser({
                  email,
                  password: generateTemporaryPassword(),
                  name,
                  father_name: fatherName,
                  grandfather_name: grandfatherName,
                  phone_number: phone,
                  address,
                  role: 'TEACHER',
                });
                const teacher = await teachersApi.create({
                  user: user.id,
                  organization: organizationId,
                  branch: branchId,
                  employee_id: employeeId,
                  bio: '',
                  specialization,
                  joining_date: new Date().toISOString().split('T')[0],
                });

                if (selectedSectionId && selectedSubjectId) {
                  await teachersApi.createAssignment({
                    teacher: teacher.id,
                    organization: organizationId,
                    subject: selectedSubjectId,
                    section: selectedSectionId,
                    academic_year: academicYearId,
                  });
                }

                if (selectedSectionId && isHomeroom) {
                  await teachersApi.createHomeroomAssignment({
                    organization: organizationId,
                    branch: branchId,
                    academic_year: academicYearId,
                    section: selectedSectionId,
                    teacher: teacher.id,
                    notes: '',
                  });
                }

                onSuccess();
              } catch (submitError) {
                setError(
                  submitError instanceof Error
                    ? submitError.message
                    : 'Failed to create teacher.',
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Creating...' : 'Create Teacher'}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

function ImportTeachersModal({
  branchId,
  organizationId,
  onClose,
  onSuccess,
}: {
  branchId: string;
  organizationId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <ModalFrame title="Bulk Import Teachers" onClose={onClose}>
      <div className="space-y-4">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm"
        />
        <p className="text-xs text-slate-500">
          Upload a teacher file and the backend will validate and persist the records.
        </p>
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!file || isUploading}
            onClick={async () => {
              if (!file) return;
              setIsUploading(true);
              setError(null);
              try {
                const started = await importApi.uploadBulkFile(
                  'teachers',
                  file,
                  organizationId,
                  branchId,
                );
                if (!started.task_id) {
                  throw new Error('Bulk import started without a task id.');
                }
                onSuccess();
              } catch (uploadError) {
                setError(
                  uploadError instanceof Error
                    ? uploadError.message
                    : 'Failed to upload teacher file.',
                );
              } finally {
                setIsUploading(false);
              }
            }}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white disabled:opacity-60"
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
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
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4"
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
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
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

function TeacherAvatar({ name, large = false }: { name: string; large?: boolean }) {
  const size = large ? 'h-20 w-20 text-2xl' : 'h-11 w-11 text-xs';
  return (
    <div
      className={`flex ${size} items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-black text-slate-500`}
    >
      {name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
      {children}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function InputField({
  label,
  type = 'text',
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field"
      />
    </label>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}
