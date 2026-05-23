import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  FileUp,
  Link2,
  Link2Off,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Parent, Student } from '../types';
import {
  ApiParent,
  ApiParentLink,
  ApiStudent,
  authApi,
  importApi,
  parentsApi,
} from '../lib/api';
import { useApiQuery } from '../hooks/useApiQuery';
import { useGrades } from '../hooks/useGrades';
import { useParents } from '../hooks/useParents';
import { useStudents } from '../hooks/useStudents';

interface ParentsProps {
  academicYear: string;
  branchId: string | null;
  organizationId: string | null;
}

type ParentFormState = {
  name: string;
  fatherName: string;
  grandfatherName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  occupation: string;
  workAddress: string;
  relationshipNotes: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  isActive: boolean;
};

const emptyParentForm: ParentFormState = {
  name: '',
  fatherName: '',
  grandfatherName: '',
  email: '',
  phone: '',
  password: '',
  address: '',
  occupation: '',
  workAddress: '',
  relationshipNotes: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  isActive: true,
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function mapStudent(student: ApiStudent, links: ApiParentLink[]): Student {
  const studentLinks = links.filter((link) => link.student === student.id);
  const primaryLink =
    studentLinks.find((link) => link.is_primary_contact) ?? studentLinks[0];

  return {
    id: student.id,
    name: `${student.first_name} ${student.last_name}`.trim(),
    firstName: student.first_name,
    lastName: student.last_name,
    grade: student.grade_name,
    gradeId: student.grade_id,
    section: student.section_name,
    sectionId: student.current_section ?? '',
    rollNo: student.roll_no,
    gender: student.gender,
    dateOfBirth: student.date_of_birth,
    admissionDate: student.admission_date,
    photoUrl: student.photo,
    registrationStatus:
      student.status === 'ACTIVE'
        ? 'Registered'
        : student.status === 'WITHDRAWN'
          ? 'Withdrawn'
          : student.status === 'GRADUATED'
            ? 'Graduated'
            : 'Pending',
    languagePreference: 'English',
    parentId: primaryLink?.parent,
    academicYearId: student.academic_year_id,
    branchId: student.branch,
    organizationId: student.organization,
  };
}

function mapParent(parent: ApiParent, links: ApiParentLink[]): Parent {
  const parentLinks = links.filter((link) => link.parent === parent.id);
  const primaryLink =
    parentLinks.find((link) => link.is_primary_contact) ?? parentLinks[0];

  return {
    id: parent.id,
    name: parent.user_details?.name ?? '',
    phone: parent.user_details?.phone_number ?? '',
    email: parent.user_details?.email ?? '',
    status:
      parentLinks.length === 0
        ? 'Pending Linkage'
        : parent.is_active
          ? 'Active'
          : 'Invited',
    linkedStudents: parentLinks.map((link) => link.student),
    languagePreference: 'English',
    relationship:
      primaryLink?.relationship_type === 'Mother'
        ? 'Mother'
        : primaryLink?.relationship_type === 'Guardian'
          ? 'Guardian'
          : 'Father',
    isPrimaryContact: primaryLink?.is_primary_contact ?? false,
    isActive: parent.is_active,
    occupation: parent.occupation,
    emergencyContactName: parent.emergency_contact_name,
    emergencyContactPhone: parent.emergency_contact_phone,
  };
}

function ParentAvatar({ name }: { name: string }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-black text-slate-500">
      {getInitials(name)}
    </div>
  );
}

export const Parents: React.FC<ParentsProps> = ({
  academicYear,
  branchId,
  organizationId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [studentToLink, setStudentToLink] = useState<Student | null>(null);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [gradeFilter, setGradeFilter] = useState('All Grades');

  const {
    parents: rawParents,
    isLoading: parentsLoading,
    error: parentsError,
    refetch: refetchParents,
  } = useParents({ branchId, organizationId, search: searchQuery || undefined });
  const {
    students: rawStudents,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useStudents({ branchId, organizationId });
  const { grades } = useGrades(branchId);

  const {
    data: linkResponse,
    isLoading: linksLoading,
    error: linksError,
    refetch: refetchLinks,
  } = useApiQuery<{ results: ApiParentLink[] } | null>(
    branchId || organizationId ? () => parentsApi.listLinks({}) : null,
    [branchId, organizationId],
  );

  const links = useMemo(() => linkResponse?.results ?? [], [linkResponse]);
  const parents = useMemo(
    () => rawParents.map((parent) => mapParent(parent, links)),
    [rawParents, links],
  );
  const students = useMemo(
    () => rawStudents.map((student) => mapStudent(student, links)),
    [rawStudents, links],
  );

  const selectedParent = useMemo(
    () => parents.find((parent) => parent.id === selectedParentId) ?? null,
    [parents, selectedParentId],
  );

  const filteredParents = useMemo(() => {
    return parents.filter((parent) => {
      const matchesSearch =
        parent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.phone.includes(searchQuery);
      const matchesGrade =
        gradeFilter === 'All Grades' ||
        students.some(
          (student) =>
            parent.linkedStudents.includes(student.id) &&
            student.grade === gradeFilter,
        );
      return matchesSearch && matchesGrade;
    });
  }, [gradeFilter, parents, searchQuery, students]);

  const unlinkedStudents = useMemo(
    () => students.filter((student) => !student.parentId),
    [students],
  );

  const stats = useMemo(
    () => ({
      totalParents: parents.length,
      activeParents: parents.filter((parent) => parent.status === 'Active').length,
      pendingLinkage: parents.filter((parent) => parent.status === 'Pending Linkage')
        .length,
      unlinkedStudents: unlinkedStudents.length,
    }),
    [parents, unlinkedStudents.length],
  );

  const refreshAll = () => {
    refetchParents();
    refetchStudents();
    refetchLinks();
  };

  async function handleLinkStudent(
    studentId: string,
    parentId: string,
    relationship: Parent['relationship'] = 'Father',
    isPrimaryContact = true,
  ) {
    await parentsApi.createLink({
      student: studentId,
      parent: parentId,
      relationship_type:
        relationship === 'Mother'
          ? 'MOTHER'
          : relationship === 'Guardian'
            ? 'GUARDIAN'
            : 'FATHER',
      is_primary_contact: isPrimaryContact,
    });
    refreshAll();
  }

  async function handleUnlinkStudent(studentId: string, parentId: string) {
    const link = links.find(
      (candidate) =>
        candidate.student === studentId && candidate.parent === parentId,
    );
    if (!link) return;
    await parentsApi.deleteLink(link.id);
    refreshAll();
  }

  if (parentsLoading || studentsLoading || linksLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Loading parent directory
          </p>
        </div>
      </div>
    );
  }

  if (parentsError || studentsError || linksError) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
          <p className="font-black text-red-700">Failed to load parents</p>
          <p className="mt-2 text-sm text-red-600">
            {parentsError || studentsError || linksError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="sticky top-0 z-20 border-b border-slate-100 bg-white px-4 py-5 shadow-sm md:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Parents
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Academic year {academicYear}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-4 py-2.5 text-sm font-bold text-primary"
              >
                <FileUp className="h-4 w-4" />
                Bulk Import
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                Invite Parent
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Total Parents" value={stats.totalParents} icon={Users} />
            <StatCard
              label="Active Parents"
              value={stats.activeParents}
              icon={ShieldCheck}
            />
            <StatCard
              label="Pending Linkage"
              value={stats.pendingLinkage}
              icon={Mail}
            />
            <StatCard
              label="Unlinked Students"
              value={stats.unlinkedStudents}
              icon={Link2Off}
            />
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search parents by name, email, or phone"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5"
              />
            </div>
            <select
              value={gradeFilter}
              onChange={(event) => setGradeFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none"
            >
              <option>All Grades</option>
              {grades.map((grade) => (
                <option key={grade.id}>{grade.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid flex-1 gap-6 overflow-hidden p-4 md:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] md:p-6">
        <div className="space-y-4 overflow-y-auto">
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
                  Parent Directory
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  {filteredParents.length} records
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {filteredParents.map((parent) => (
                <button
                  key={parent.id}
                  onClick={() => setSelectedParentId(parent.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    selectedParentId === parent.id
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ParentAvatar name={parent.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-black text-slate-900">
                        {parent.name}
                      </p>
                      <ParentStatusBadge status={parent.status} />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {parent.email || 'No email'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {parent.phone || 'No phone'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">
                      {parent.linkedStudents.length}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      linked students
                    </p>
                  </div>
                </button>
              ))}
              {filteredParents.length === 0 && (
                <EmptyState
                  title="No parents found"
                  message="Try a different search or invite a new parent."
                />
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
                  Students Needing Linkage
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  {unlinkedStudents.length} without a linked parent
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {unlinkedStudents.map((student) => (
                <div
                  key={student.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-900">{student.name}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {student.grade} • Section {student.section}
                      </p>
                    </div>
                    <button
                      onClick={() => setStudentToLink(student)}
                      className="rounded-xl bg-primary px-3 py-2 text-xs font-black text-white shadow-lg shadow-primary/20"
                    >
                      Link
                    </button>
                  </div>
                </div>
              ))}
              {unlinkedStudents.length === 0 && (
                <EmptyState
                  title="All students linked"
                  message="No outstanding parent linkage work right now."
                />
              )}
            </div>
          </section>
        </div>

        <section className="overflow-y-auto rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          {selectedParent ? (
            <ParentDetailPanel
              parent={selectedParent}
              students={students.filter((student) =>
                selectedParent.linkedStudents.includes(student.id),
              )}
              allStudents={students}
              onEdit={() => setEditingParent(selectedParent)}
              onLinkStudent={() => setStudentToLink(null)}
              onLink={handleLinkStudent}
              onUnlink={handleUnlinkStudent}
            />
          ) : (
            <EmptyState
              title="Select a parent"
              message="Choose a parent from the directory to view and manage their linked students."
            />
          )}
        </section>
      </div>

      <AnimatePresence>
        {showInviteModal && branchId && organizationId && (
          <ParentFormModal
            title="Invite Parent"
            initialValue={emptyParentForm}
            onClose={() => setShowInviteModal(false)}
            onSubmit={async (form) => {
              const user = await authApi.registerUser({
                email: form.email,
                password: form.password,
                name: form.name,
                father_name: form.fatherName,
                grandfather_name: form.grandfatherName,
                phone_number: form.phone,
                address: form.address,
                role: 'PARENT',
              });
              await parentsApi.create({
                user: user.id,
                branches: [branchId],
                organizations: [organizationId],
                is_active: form.isActive,
                occupation: form.occupation,
                work_address: form.workAddress,
                relationship_notes: form.relationshipNotes,
                emergency_contact_name: form.emergencyContactName,
                emergency_contact_phone: form.emergencyContactPhone,
                secondary_phone_number: form.phone,
              });
              setShowInviteModal(false);
              refreshAll();
            }}
          />
        )}
        {editingParent && (
          <ParentFormModal
            title="Edit Parent"
            initialValue={{
              name: editingParent.name,
              fatherName: '',
              grandfatherName: '',
              email: editingParent.email,
              phone: editingParent.phone,
              password: '',
              address: '',
              occupation: editingParent.occupation ?? '',
              workAddress: '',
              relationshipNotes: editingParent.relationship ?? '',
              emergencyContactName: editingParent.emergencyContactName ?? '',
              emergencyContactPhone: editingParent.emergencyContactPhone ?? '',
              isActive: editingParent.isActive,
            }}
            onClose={() => setEditingParent(null)}
            onSubmit={async (form) => {
              await parentsApi.update(editingParent.id, {
                is_active: form.isActive,
                occupation: form.occupation,
                work_address: form.workAddress,
                relationship_notes: form.relationshipNotes,
                emergency_contact_name: form.emergencyContactName,
                emergency_contact_phone: form.emergencyContactPhone,
                secondary_phone_number: form.phone,
                user: rawParents.find((parent) => parent.id === editingParent.id)?.user ?? '',
                organizations:
                  rawParents.find((parent) => parent.id === editingParent.id)?.organizations ??
                  [],
                branches:
                  rawParents.find((parent) => parent.id === editingParent.id)?.branches ?? [],
              });
              setEditingParent(null);
              refreshAll();
            }}
          />
        )}
        {studentToLink && (
          <LinkStudentModal
            student={studentToLink}
            parents={parents}
            onClose={() => setStudentToLink(null)}
            onSubmit={async (payload) => {
              await handleLinkStudent(
                studentToLink.id,
                payload.parentId,
                payload.relationship,
                payload.isPrimaryContact,
              );
              setStudentToLink(null);
            }}
          />
        )}
        {showImportModal && branchId && organizationId && (
          <ImportParentsModal
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

function ParentStatusBadge({ status }: { status: Parent['status'] }) {
  const classes =
    status === 'Active'
      ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
      : status === 'Invited'
        ? 'border-amber-100 bg-amber-50 text-amber-700'
        : 'border-slate-200 bg-slate-100 text-slate-600';

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${classes}`}
    >
      {status}
    </span>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <p className="font-black text-slate-700">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}

function ParentDetailPanel({
  parent,
  students,
  allStudents,
  onEdit,
  onLinkStudent,
  onLink,
  onUnlink,
}: {
  parent: Parent;
  students: Student[];
  allStudents: Student[];
  onEdit: () => void;
  onLinkStudent: () => void;
  onLink: (
    studentId: string,
    parentId: string,
    relationship?: Parent['relationship'],
    isPrimaryContact?: boolean,
  ) => Promise<void>;
  onUnlink: (studentId: string, parentId: string) => Promise<void>;
}) {
  const [linkingOpen, setLinkingOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const availableStudents = allStudents.filter((student) => !student.parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <ParentAvatar name={parent.name} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">{parent.name}</h2>
              <ParentStatusBadge status={parent.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">{parent.relationship}</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700"
        >
          <span className="flex items-center gap-2">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </span>
        </button>
      </div>

      <div className="grid gap-3">
        <InfoRow icon={Mail} label="Email" value={parent.email || 'Not provided'} />
        <InfoRow icon={Phone} label="Phone" value={parent.phone || 'Not provided'} />
        <InfoRow
          icon={ShieldCheck}
          label="Primary Contact"
          value={parent.isPrimaryContact ? 'Yes' : 'No'}
        />
        <InfoRow
          icon={User}
          label="Occupation"
          value={parent.occupation || 'Not provided'}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
            Linked Students
          </h3>
          <button
            onClick={() => {
              onLinkStudent();
              setLinkingOpen((current) => !current);
            }}
            className="rounded-xl bg-primary px-3 py-2 text-xs font-black text-white"
          >
            <span className="flex items-center gap-2">
              <Link2 className="h-3.5 w-3.5" />
              Link Student
            </span>
          </button>
        </div>
        <div className="space-y-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3"
            >
              <div>
                <p className="text-sm font-black text-slate-900">{student.name}</p>
                <p className="text-xs text-slate-500">
                  {student.grade} • Section {student.section}
                </p>
              </div>
              <button
                onClick={() => onUnlink(student.id, parent.id)}
                className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-700"
              >
                <span className="flex items-center gap-2">
                  <Link2Off className="h-3.5 w-3.5" />
                  Unlink
                </span>
              </button>
            </div>
          ))}
          {students.length === 0 && (
            <EmptyState
              title="No linked students"
              message="Link this parent to a student to enable communication and attendance follow-up."
            />
          )}
        </div>
      </div>

      {linkingOpen && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Quick Link
          </p>
          <div className="mt-3 flex gap-2">
            <select
              value={selectedStudentId}
              onChange={(event) => setSelectedStudentId(event.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">Select a student</option>
              {availableStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.grade} {student.section}
                </option>
              ))}
            </select>
            <button
              onClick={async () => {
                if (!selectedStudentId) return;
                await onLink(selectedStudentId, parent.id, parent.relationship, true);
                setSelectedStudentId('');
                setLinkingOpen(false);
              }}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-black text-white"
            >
              Link
            </button>
          </div>
        </div>
      )}
    </div>
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
        className="w-full max-w-xl rounded-3xl bg-white shadow-2xl"
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

function ParentFormModal({
  title,
  initialValue,
  onClose,
  onSubmit,
}: {
  title: string;
  initialValue: ParentFormState;
  onClose: () => void;
  onSubmit: (form: ParentFormState) => Promise<void>;
}) {
  const [form, setForm] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <ModalFrame title={title} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setError(null);
          try {
            await onSubmit(form);
          } catch (submitError) {
            setError(
              submitError instanceof Error
                ? submitError.message
                : 'Failed to save parent.',
            );
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <InputField
          label="Parent Name"
          value={form.name}
          onChange={(value) => setForm({ ...form, name: value })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Father Name"
            value={form.fatherName}
            onChange={(value) => setForm({ ...form, fatherName: value })}
          />
          <InputField
            label="Grandfather Name"
            value={form.grandfatherName}
            onChange={(value) => setForm({ ...form, grandfatherName: value })}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Email"
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Phone"
            value={form.phone}
            onChange={(value) => setForm({ ...form, phone: value })}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Password"
            type="password"
            value={form.password}
            onChange={(value) => setForm({ ...form, password: value })}
          />
          <InputField
            label="Address"
            value={form.address}
            onChange={(value) => setForm({ ...form, address: value })}
          />
        </div>
        <InputField
          label="Occupation"
          value={form.occupation}
          onChange={(value) => setForm({ ...form, occupation: value })}
        />
        <InputField
          label="Work Address"
          value={form.workAddress}
          onChange={(value) => setForm({ ...form, workAddress: value })}
        />
        <InputField
          label="Relationship Notes"
          value={form.relationshipNotes}
          onChange={(value) => setForm({ ...form, relationshipNotes: value })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Emergency Contact Name"
            value={form.emergencyContactName}
            onChange={(value) =>
              setForm({ ...form, emergencyContactName: value })
            }
          />
          <InputField
            label="Emergency Contact Phone"
            value={form.emergencyContactPhone}
            onChange={(value) =>
              setForm({ ...form, emergencyContactPhone: value })
            }
          />
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm({ ...form, isActive: event.target.checked })
            }
          />
          <span className="text-sm font-bold text-slate-700">Parent is active</span>
        </label>
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !form.name ||
              !form.fatherName ||
              !form.grandfatherName ||
              !form.email ||
              !form.phone ||
              (!title.includes('Edit') && !form.password) ||
              !form.address
            }
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Save Parent'}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}

function LinkStudentModal({
  student,
  parents,
  onClose,
  onSubmit,
}: {
  student: Student;
  parents: Parent[];
  onClose: () => void;
  onSubmit: (payload: {
    parentId: string;
    relationship: Parent['relationship'];
    isPrimaryContact: boolean;
  }) => Promise<void>;
}) {
  const [parentId, setParentId] = useState('');
  const [relationship, setRelationship] = useState<Parent['relationship']>('Father');
  const [isPrimaryContact, setIsPrimaryContact] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <ModalFrame title={`Link ${student.name}`} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          {student.grade} • Section {student.section}
        </p>
        <select
          value={parentId}
          onChange={(event) => setParentId(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
        >
          <option value="">Select parent</option>
          {parents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name} - {parent.phone || parent.email}
            </option>
          ))}
        </select>
        <select
          value={relationship}
          onChange={(event) =>
            setRelationship(event.target.value as Parent['relationship'])
          }
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
        >
          <option>Father</option>
          <option>Mother</option>
          <option>Guardian</option>
        </select>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={isPrimaryContact}
            onChange={(event) => setIsPrimaryContact(event.target.checked)}
          />
          <span className="text-sm font-bold text-slate-700">
            Set as primary contact
          </span>
        </label>
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
            disabled={!parentId || isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                await onSubmit({ parentId, relationship, isPrimaryContact });
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Linking...' : 'Link Parent'}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

function ImportParentsModal({
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
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);

  return (
    <ModalFrame title="Bulk Import Parents" onClose={onClose}>
      <div className="space-y-4">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm"
        />
        <p className="text-xs text-slate-500">
          Upload a parent import file. The backend will validate and create the records.
        </p>
        {(isUploading || taskId) && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-700">
                {taskId ? `Import job ${taskId.slice(0, 8)}...` : 'Starting import...'}
              </p>
              <span className="text-xs font-black uppercase tracking-widest text-primary">
                {progress}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
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
              setProgress(25);
              setTaskId(null);
              try {
                const started = await importApi.uploadBulkFile(
                  'parents',
                  file,
                  organizationId,
                  branchId,
                );
                if (!started.task_id) {
                  throw new Error('Bulk import started without a task id.');
                }
                setTaskId(started.task_id);
                setProgress(50);
                let attempts = 0;
                while (attempts < 60) {
                  const job = await importApi.getStatus(started.task_id);
                  setProgress(Math.max(55, Math.min(job.progress || 0, 100)));
                  if (job.status === 'success') {
                    setProgress(100);
                    onSuccess();
                    return;
                  }
                  if (job.status === 'failed') {
                    const jobErrors =
                      typeof job.errors === 'string'
                        ? job.errors
                        : JSON.stringify(job.errors);
                    throw new Error(jobErrors || 'Bulk import failed.');
                  }
                  attempts += 1;
                  await new Promise((resolve) => setTimeout(resolve, 2000));
                }
                throw new Error('Bulk import is still processing. Check again shortly.');
              } catch (uploadError) {
                setError(
                  uploadError instanceof Error
                    ? uploadError.message
                    : 'Failed to upload parent file.',
                );
                setTaskId(null);
                setProgress(0);
              } finally {
                setIsUploading(false);
              }
            }}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white disabled:opacity-60"
          >
            {isUploading ? 'Importing...' : 'Upload File'}
          </button>
        </div>
      </div>
    </ModalFrame>
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
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5"
      />
    </label>
  );
}
