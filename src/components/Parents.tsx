import React, { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  Check,
  FileUp,
  FileText,
  Link2,
  Link2Off,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Parent, Student } from "../types"
import {
  extractApiError,
  extractUserReadableErrorMessages,
  ApiParent,
  ApiParentInvitePayload,
  ApiParentLink,
  ApiStudent,
  importApi,
  parentsApi,
  studentsApi,
} from "../lib/api"
import { useApiQuery } from "../hooks/useApiQuery"
import { useGrades } from "../hooks/useGrades"
import { useStudents } from "../hooks/useStudents"
import { useParents } from "../hooks/useParents"

interface ParentsProps {
  academicYear: string
  branchId: string | null
  organizationId: string | null
}

type ParentFilter = "all" | "active" | "pending" | "unlinked"

type ParentFormState = {
  name: string
  email: string
  fatherName: string
  grandfatherName: string
  phone: string
  secondaryPhone: string
  occupation: string
  workAddress: string
  relationshipNotes: string
  emergencyContactName: string
  emergencyContactPhone: string
}

const emptyParentForm: ParentFormState = {
  name: "",
  email: "",
  fatherName: "",
  grandfatherName: "",
  phone: "",
  secondaryPhone: "",
  occupation: "",
  workAddress: "",
  relationshipNotes: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function mapStudent(student: ApiStudent, links: ApiParentLink[]): Student {
  const studentLinks = links.filter((link) => link.student === student.id)
  const primaryLink =
    studentLinks.find((link) => link.is_primary_contact) ?? studentLinks[0]

  return {
    id: student.id,
    name: `${student.first_name} ${student.last_name}`.trim(),
    firstName: student.first_name,
    lastName: student.last_name,
    grade: student.grade_name,
    gradeId: student.grade_id,
    section: student.section_name,
    sectionId: student.current_section ?? "",
    rollNo: student.roll_no,
    gender: student.gender,
    dateOfBirth: student.date_of_birth,
    admissionDate: student.admission_date,
    photoUrl: student.photo,
    registrationStatus:
      student.status === "ACTIVE"
        ? "Registered"
        : student.status === "WITHDRAWN"
          ? "Withdrawn"
          : student.status === "GRADUATED"
            ? "Graduated"
            : "Pending",
    languagePreference: "English",
    parentId: primaryLink?.parent,
    academicYearId: student.academic_year_id,
    branchId: student.branch,
    organizationId: student.organization,
  }
}

function mapParent(parent: ApiParent, links: ApiParentLink[]): Parent {
  const parentLinks = links.filter((link) => link.parent === parent.id)
  const primaryLink =
    parentLinks.find((link) => link.is_primary_contact) ?? parentLinks[0]
  const linkedStudentCount = parentLinks.length
  const linkedGrades = Array.from(
    new Set(
      parent.student_details
        ?.map((student) => student.grade_name)
        .filter(Boolean) ?? []
    )
  )
  const status =
    linkedStudentCount === 0 ? "Unlinked" : parent.is_active ? "Active" : "Pending"
  const phoneNumber = parent.user_details?.phone_number ?? ""

  return {
    id: parent.id,
    name: parent.user_details?.name ?? "",
    fatherName: parent.user_details?.father_name ?? "",
    grandfatherName: parent.user_details?.grandfather_name ?? "",
    phone: phoneNumber,
    email: parent.user_details?.email ?? "",
    status,
    linkedStudents: parentLinks.map((link) => link.student),
    linkedStudentDetails:
      parent.student_details?.map((student) => ({
        id: student.id,
        name: `${student.first_name} ${student.last_name}`.trim(),
        grade: student.grade_name,
        section: student.section_name,
      })) ?? [],
    linkedStudentCount,
    linkedGrades,
    languagePreference: "English",
    relationship:
      primaryLink?.relationship_type === "Mother"
        ? "Mother"
        : primaryLink?.relationship_type === "Guardian"
          ? "Guardian"
          : "Father",
    isPrimaryContact: primaryLink?.is_primary_contact ?? false,
    isActive: parent.is_active,
    isInviteEligible: !parent.is_active && phoneNumber.trim().length > 0,
    occupation: parent.occupation,
    emergencyContactName: parent.emergency_contact_name,
    emergencyContactPhone: parent.emergency_contact_phone,
  }
}

function buildParentLineage(
  parent: Pick<Parent, "name" | "fatherName" | "grandfatherName">
) {
  return [parent.name, parent.fatherName, parent.grandfatherName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ")
}

function normalizeOptionalValue(value: string) {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function buildParentInvitePayload(
  form: ParentFormState,
  branchId: string
): ApiParentInvitePayload {
  return {
    name: form.name.trim(),
    email: normalizeOptionalValue(form.email),
    father_name: form.fatherName.trim(),
    grandfather_name: form.grandfatherName.trim(),
    phone_number: form.phone.trim(),
    branch: branchId,
    secondary_phone_number: normalizeOptionalValue(form.secondaryPhone),
    occupation: normalizeOptionalValue(form.occupation),
    work_address: normalizeOptionalValue(form.workAddress),
    relationship_notes: normalizeOptionalValue(form.relationshipNotes),
    emergency_contact_name: normalizeOptionalValue(form.emergencyContactName),
    emergency_contact_phone: normalizeOptionalValue(form.emergencyContactPhone),
  }
}

async function fetchAllParentLinks(): Promise<ApiParentLink[]> {
  const links: ApiParentLink[] = []
  let page = 1

  while (true) {
    const response = await parentsApi.listLinks({ page })
    links.push(...response.results)

    if (!response.next) break
    page += 1
  }

  return links
}

async function fetchAllStudents(params: {
  branchId?: string | null
  organizationId?: string | null
}): Promise<ApiStudent[]> {
  const { branchId, organizationId } = params
  const students: ApiStudent[] = []
  let page = 1

  while (true) {
    const response = await studentsApi.list({
      branch: branchId ?? undefined,
      organization: organizationId ?? undefined,
      page,
    })
    students.push(...response.results)

    if (!response.next) break
    page += 1
  }

  return students
}

function buildParentFormState(parent: ApiParent): ParentFormState {
  return {
    name: parent.user_details?.name ?? "",
    email: parent.user_details?.email ?? "",
    fatherName: parent.user_details?.father_name ?? "",
    grandfatherName: parent.user_details?.grandfather_name ?? "",
    phone: parent.user_details?.phone_number ?? "",
    secondaryPhone: parent.secondary_phone_number ?? "",
    occupation: parent.occupation ?? "",
    workAddress: parent.work_address ?? "",
    relationshipNotes: parent.relationship_notes ?? "",
    emergencyContactName: parent.emergency_contact_name ?? "",
    emergencyContactPhone: parent.emergency_contact_phone ?? "",
  }
}

function ParentAvatar({ name }: { name: string }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-black text-slate-500">
      {getInitials(name)}
    </div>
  )
}

export const Parents: React.FC<ParentsProps> = ({
  academicYear,
  branchId,
  organizationId,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [parentFilter, setParentFilter] = useState<ParentFilter>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasResolvedInitialLoad, setHasResolvedInitialLoad] = useState(false)
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [linkingParentId, setLinkingParentId] = useState<string | null>(null)
  const [invitingParentId, setInvitingParentId] = useState<string | null>(null)
  const [editingParent, setEditingParent] = useState<Parent | null>(null)
  const [gradeFilter, setGradeFilter] = useState("All Grades")
  const [inviteActionError, setInviteActionError] = useState<string | null>(
    null
  )
  const [inviteActionMessage, setInviteActionMessage] = useState<string | null>(
    null
  )
  const [inviteActionLink, setInviteActionLink] = useState<string | null>(null)
  const [inviteSubmittingParentId, setInviteSubmittingParentId] = useState<
    string | null
  >(null)
  useEffect(() => {
    if (!inviteActionError && !inviteActionMessage) return
    const timeoutId = window.setTimeout(() => {
      setInviteActionError(null)
      setInviteActionMessage(null)
      setInviteActionLink(null)
    }, 4500)
    return () => window.clearTimeout(timeoutId)
  }, [inviteActionError, inviteActionMessage])

  const {
    students: rawStudents,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useStudents({ branchId, organizationId })
  const {
    data: allRawStudents,
    refetch: refetchAllStudents,
  } = useApiQuery<ApiStudent[]>(
    branchId || organizationId
      ? () => fetchAllStudents({ branchId, organizationId })
      : null,
    [branchId, organizationId]
  )
  const { grades } = useGrades(branchId)
  const {
    parents: rawParents,
    count: parentCount,
    hasNextPage,
    hasPreviousPage,
    isLoading: parentsLoading,
    error: parentsError,
    refetch: refetchParents,
  } = useParents({
    branchId,
    organizationId,
    page: currentPage,
    search: searchQuery || undefined,
  })

  const {
    data: links,
    isLoading: linksLoading,
    error: linksError,
    refetch: refetchLinks,
  } = useApiQuery<ApiParentLink[]>(
    branchId || organizationId ? () => fetchAllParentLinks() : null,
    [branchId, organizationId]
  )

  const students = useMemo(
    () => rawStudents.map((student) => mapStudent(student, links ?? [])),
    [rawStudents, links]
  )
  const allStudents = useMemo(
    () => (allRawStudents ?? []).map((student) => mapStudent(student, links ?? [])),
    [allRawStudents, links]
  )
  const allMappedParents = useMemo(
    () => (rawParents ?? []).map((parent) => mapParent(parent, links ?? [])),
    [rawParents, links]
  )
  const parentFilterQuery = searchQuery.trim().toLowerCase()
  const parentFilterFn = useMemo(
    () => (parent: Parent) => {
      const matchesSearch =
        parentFilterQuery.length === 0 ||
        parent.name.toLowerCase().includes(parentFilterQuery) ||
        parent.email.toLowerCase().includes(parentFilterQuery) ||
        parent.phone.toLowerCase().includes(parentFilterQuery)
      const matchesGrade =
        gradeFilter === "All Grades" ||
        parent.linkedStudentCount === 0 ||
        parent.linkedGrades?.includes(gradeFilter)
      const matchesStatus =
        parentFilter === "all" ||
        (parentFilter === "active" && parent.isActive) ||
        (parentFilter === "pending" && !parent.isActive) ||
        (parentFilter === "unlinked" && parent.linkedStudentCount === 0)

      return matchesSearch && matchesGrade && matchesStatus
    },
    [gradeFilter, parentFilter, parentFilterQuery]
  )
  const filteredParents = useMemo(
    () =>
      allMappedParents
        .filter(parentFilterFn)
        .sort((left, right) =>
          left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
        ),
    [allMappedParents, parentFilterFn]
  )

  const selectedParent = useMemo(
    () => allMappedParents.find((parent) => parent.id === selectedParentId) ?? null,
    [allMappedParents, selectedParentId]
  )
  const linkingParent = useMemo(
    () => allMappedParents.find((parent) => parent.id === linkingParentId) ?? null,
    [allMappedParents, linkingParentId]
  )
  const invitingParent = useMemo(() => {
    if (!invitingParentId) return null

    return rawParents?.find((parent) => parent.id === invitingParentId) ?? null
  }, [rawParents, invitingParentId])

  useEffect(() => {
    setCurrentPage(1)
  }, [branchId, organizationId])

  useEffect(() => {
    setSelectedParentId(null)
  }, [currentPage])
  const unlinkedParents = useMemo(
    () => allMappedParents.filter((parent) => parent.linkedStudentCount === 0),
    [allMappedParents]
  )

  const totalUnlinkedParents = useMemo(() => {
    return unlinkedParents.length
  }, [unlinkedParents.length])

  const stats = useMemo(
    () => ({
      totalParents: parentCount,
      activeParents: allMappedParents.filter((parent) => parent.isActive).length,
      pendingParents: allMappedParents.filter((parent) => !parent.isActive).length,
      unlinkedParents: totalUnlinkedParents,
    }),
    [
      parentCount,
      allMappedParents,
      totalUnlinkedParents,
    ]
  )

  const filterOptions = useMemo(
    () => [
      { id: "all" as const, label: "All Parents", count: parentCount },
      {
        id: "active" as const,
        label: "Active",
        count: stats.activeParents,
      },
      {
        id: "pending" as const,
        label: "Pending",
        count: stats.pendingParents,
      },
      {
        id: "unlinked" as const,
        label: "Unlinked Parents",
        count: stats.unlinkedParents,
      },
    ],
    [
      parentCount,
      stats.activeParents,
      stats.pendingParents,
      stats.unlinkedParents,
    ]
  )

  const isLoading = parentsLoading || studentsLoading || linksLoading
  const isInitialLoading = !hasResolvedInitialLoad && isLoading
  const isBackgroundRefreshing = hasResolvedInitialLoad && isLoading

  useEffect(() => {
    if (!isLoading) {
      setHasResolvedInitialLoad(true)
    }
  }, [isLoading])

  const refreshAll = () => {
    refetchParents()
    refetchStudents()
    refetchAllStudents()
    refetchLinks()
  }

  async function handleLinkStudent(
    studentId: string,
    parentId: string,
    relationship: Parent["relationship"] = "Father",
    isPrimaryContact = true
  ) {
    await parentsApi.createLink({
      student: studentId,
      parent: parentId,
      relationship_type:
        relationship === "Mother"
          ? "MOTHER"
          : relationship === "Guardian"
            ? "GUARDIAN"
            : "FATHER",
      is_primary_contact: isPrimaryContact,
    })
    refreshAll()
  }

  async function handleUnlinkStudent(studentId: string, parentId: string) {
    const link = links.find(
      (candidate) =>
        candidate.student === studentId && candidate.parent === parentId
    )
    if (!link) return
    await parentsApi.deleteLink(link.id)
    refreshAll()
  }

  async function submitParentInvite(
    form: ParentFormState,
    options?: { parentId?: string; onSuccess?: () => void }
  ) {
    if (!branchId) return

    setInviteSubmittingParentId(options?.parentId ?? null)
    setInviteActionError(null)
    setInviteActionMessage(null)
    setInviteActionLink(null)
    try {
      const payload = buildParentInvitePayload(form, branchId)

      if (!payload.phone_number) {
        throw new Error(
          "A valid phone number is required before sending an invitation."
        )
      }
      if (!payload.father_name || !payload.grandfather_name) {
        throw new Error(
          "Parent record is missing father or grandfather name. Update the parent details before inviting."
        )
      }

      const response = await parentsApi.invite(payload)
      setInviteActionMessage(
        response.message ??
          `Invitation sent to ${form.name.trim() || "parent"}.`
      )
      setInviteActionLink(response.invitation_url ?? null)
      options?.onSuccess?.()
      refreshAll()
    } catch (error) {
      setInviteActionError(extractApiError(error))
    } finally {
      setInviteSubmittingParentId(null)
    }
  }

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
            Loading parent directory
          </p>
        </div>
      </div>
    )
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
    )
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
                type="button"
                disabled
                title="Bulk parent invitations are not available yet."
                className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-amber-200 px-4 py-2.5 text-sm font-bold text-white shadow-none"
              >
                <Mail className="h-4 w-4" />
                Bulk Invite Unavailable
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
            <StatCard
              label="Total Parents"
              value={stats.totalParents}
              icon={Users}
            />
            <StatCard
              label="Active Parents"
              value={stats.activeParents}
              icon={ShieldCheck}
            />
            <StatCard
              label="Pending Parents"
              value={stats.pendingParents}
              icon={Mail}
            />
            <StatCard
              label="Unlinked Parents"
              value={stats.unlinkedParents}
              icon={Link2Off}
            />
          </div>

          <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
            <div className="no-scrollbar flex overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setParentFilter(option.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all lg:flex-none ${
                    parentFilter === option.id
                      ? "bg-primary text-white shadow-md shadow-primary/10"
                      : "text-slate-500 hover:text-primary"
                  }`}
                >
                  {option.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      parentFilter === option.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {option.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex w-full flex-wrap items-center justify-end gap-2 md:gap-3 lg:w-auto">
              <select
                value={gradeFilter}
                onChange={(event) => setGradeFilter(event.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 lg:flex-none"
              >
                <option>All Grades</option>
                {grades.map((grade) => (
                  <option key={grade.id}>{grade.name}</option>
                ))}
              </select>
              <div className="relative w-full md:flex-1 lg:w-72 lg:flex-none">
                <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search parents by name, email, or phone"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 text-sm transition outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5"
                />
              </div>
            </div>
          </div>
          {(inviteActionError || inviteActionMessage) && (
            <div
              className={`rounded-2xl border p-3 text-sm font-medium ${
                inviteActionError
                  ? "border-red-100 bg-red-50 text-red-700"
                  : "border-emerald-100 bg-emerald-50 text-emerald-700"
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  {inviteActionError ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>{inviteActionError ?? inviteActionMessage}</span>
                </div>
                {!inviteActionError && inviteActionLink && (
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(inviteActionLink)
                    }}
                    className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-black tracking-wide text-emerald-700 transition hover:bg-emerald-50"
                  >
                    Copy Invitation Link
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            {isBackgroundRefreshing && (
              <div className="mb-4 flex items-center justify-end gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Refreshing page...
              </div>
            )}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black tracking-widest text-slate-900 uppercase">
                  Parent Directory
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  {filteredParents.length} record
                  {filteredParents.length === 1 ? "" : "s"}
                  {" "}on this page
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {filteredParents.map((parent) => (
                <div
                  key={parent.id}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    selectedParentId === parent.id
                      ? "border-primary/30 bg-primary/5"
                      : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <button
                    onClick={() => setSelectedParentId(parent.id)}
                    className="flex min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    <ParentAvatar name={parent.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-black text-slate-900">
                          {buildParentLineage({
                            name: parent.name,
                            fatherName: parent.fatherName,
                            grandfatherName: undefined,
                          })}
                        </p>
                        <ParentStatusBadge
                          status={parent.status}
                          isActive={parent.isActive}
                        />
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {parent.email || "No email"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {parent.phone || "No phone"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">
                        {parent.linkedStudentCount ??
                          parent.linkedStudents.length}
                      </p>
                      <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        linked students
                      </p>
                    </div>
                  </button>
                  {!parent.isActive && (
                    <button
                      onClick={() => setInvitingParentId(parent.id)}
                      disabled={inviteSubmittingParentId === parent.id}
                      title="Review details and send parent SMS invitation"
                      className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {inviteSubmittingParentId === parent.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              ))}
              {filteredParents.length === 0 && (
                <EmptyState
                  title="No parents found"
                  message="Try a different search, status filter, or invite a new parent."
                />
              )}
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-slate-500">
                Page {currentPage} · {parentCount} total parent
                {parentCount === 1 ? "" : "s"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={!hasPreviousPage}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => page + 1)}
                  disabled={!hasNextPage}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {selectedParent && (
          <ParentDetailDrawer
            parent={selectedParent}
            students={allStudents.filter((student) =>
              selectedParent.linkedStudents.includes(student.id)
            )}
            onClose={() => setSelectedParentId(null)}
            onEdit={() => setEditingParent(selectedParent)}
            onLinkStudent={() => setLinkingParentId(selectedParent.id)}
            onInvite={() => setInvitingParentId(selectedParent.id)}
            onUnlink={handleUnlinkStudent}
          />
        )}
        {showInviteModal && branchId && (
          <ParentFormModal
            title="Invite Parent"
            initialValue={emptyParentForm}
            onClose={() => setShowInviteModal(false)}
            onSubmit={async (form) => {
              await submitParentInvite(form, {
                onSuccess: () => setShowInviteModal(false),
              })
            }}
          />
        )}
        {invitingParent && branchId && (
          <ParentFormModal
            title={
              invitingParent.is_active
                ? "Send Parent Invitation"
                : "Review Parent Invitation"
            }
            initialValue={buildParentFormState(invitingParent)}
            onClose={() => setInvitingParentId(null)}
            onSubmit={async (form) => {
              await submitParentInvite(form, {
                parentId: invitingParent.id,
                onSuccess: () => setInvitingParentId(null),
              })
            }}
          />
        )}
        {editingParent && (
          <ParentFormModal
            title="Edit Parent"
            initialValue={{
              name: editingParent.name,
              fatherName:
                rawParents?.find((parent) => parent.id === editingParent.id)
                  ?.user_details?.father_name ?? "",
              email:
                rawParents?.find((parent) => parent.id === editingParent.id)
                  ?.user_details?.email ?? "",
              grandfatherName:
                rawParents?.find((parent) => parent.id === editingParent.id)
                  ?.user_details?.grandfather_name ?? "",
              phone: editingParent.phone,
              secondaryPhone:
                rawParents?.find((parent) => parent.id === editingParent.id)
                  ?.secondary_phone_number ?? "",
              occupation: editingParent.occupation ?? "",
              workAddress:
                rawParents?.find((parent) => parent.id === editingParent.id)
                  ?.work_address ?? "",
              relationshipNotes:
                rawParents?.find((parent) => parent.id === editingParent.id)
                  ?.relationship_notes ?? "",
              emergencyContactName: editingParent.emergencyContactName ?? "",
              emergencyContactPhone: editingParent.emergencyContactPhone ?? "",
            }}
            onClose={() => setEditingParent(null)}
            onSubmit={async (form) => {
              await parentsApi.update(editingParent.id, {
                occupation: form.occupation,
                work_address: form.workAddress,
                relationship_notes: form.relationshipNotes,
                emergency_contact_name: form.emergencyContactName,
                emergency_contact_phone: form.emergencyContactPhone,
                secondary_phone_number: form.secondaryPhone,
                user:
                  rawParents?.find((parent) => parent.id === editingParent.id)
                    ?.user ?? "",
                organizations:
                  rawParents?.find((parent) => parent.id === editingParent.id)
                    ?.organizations ?? [],
                branches:
                  rawParents?.find((parent) => parent.id === editingParent.id)
                    ?.branches ?? [],
              })
              setEditingParent(null)
              refreshAll()
            }}
          />
        )}
        {linkingParent && (
          <LinkStudentModal
            parent={linkingParent}
            students={allStudents}
            onClose={() => setLinkingParentId(null)}
            onSubmit={async (payload) => {
              await handleLinkStudent(
                payload.studentId,
                linkingParent.id,
                payload.relationship,
                payload.isPrimaryContact
              )
              setLinkingParentId(null)
            }}
          />
        )}
        {showImportModal && branchId && organizationId && (
          <ImportParentsModal
            branchId={branchId}
            organizationId={organizationId}
            onClose={() => setShowImportModal(false)}
            onSuccess={() => {
              setShowImportModal(false)
              refreshAll()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-primary shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
    </div>
  )
}

function ParentStatusBadge({
  status,
  isActive,
}: {
  status: Parent["status"]
  isActive: boolean
}) {
  const isLinked = status !== "Unlinked"
  const activeClasses = isActive
    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
    : "border-amber-100 bg-amber-50 text-amber-700"
  const linkClasses = isLinked
    ? "border-sky-100 bg-sky-50 text-sky-700"
    : "border-slate-200 bg-slate-100 text-slate-600"

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={`rounded-full border px-2 py-0.5 text-[10px] font-black tracking-widest uppercase ${activeClasses}`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
      <span
        className={`rounded-full border px-2 py-0.5 text-[10px] font-black tracking-widest uppercase ${linkClasses}`}
      >
        {isLinked ? "Linked" : "Unlinked"}
      </span>
    </div>
  )
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <p className="font-black text-slate-700">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  )
}

function ParentDetailDrawer({
  parent,
  students,
  onClose,
  onEdit,
  onLinkStudent,
  onInvite,
  onUnlink,
}: {
  parent: Parent
  students: Student[]
  onClose: () => void
  onEdit: () => void
  onLinkStudent: () => void
  onInvite: () => void
  onUnlink: (studentId: string, parentId: string) => Promise<void>
}) {
  const parentLineage = buildParentLineage(parent)
  const linkedStudents = useMemo(() => {
    const resolvedStudents = new Map(
      students.map((student) => [
        student.id,
        {
          id: student.id,
          name: student.name,
          grade: student.grade,
          section: student.section,
          rollNo: student.rollNo,
        },
      ])
    )
    const fallbackStudents = new Map(
      (parent.linkedStudentDetails ?? []).map((student) => [student.id, student])
    )

    return parent.linkedStudents.map((studentId) => {
      const fallbackStudent = fallbackStudents.get(studentId)
      const resolvedStudent = resolvedStudents.get(studentId)
      if (resolvedStudent) {
        return {
          id: studentId,
          name: fallbackStudent?.name || resolvedStudent.name,
          grade: fallbackStudent?.grade || resolvedStudent.grade,
          section: fallbackStudent?.section || resolvedStudent.section,
        }
      }

      return {
        id: studentId,
        name: fallbackStudent?.name ?? "Linked student",
        grade: fallbackStudent?.grade ?? "",
        section: fallbackStudent?.section ?? "",
      }
    })
  }, [parent.linkedStudentDetails, parent.linkedStudents, students])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex justify-end bg-slate-950/35 backdrop-blur-[1px]"
    >
      <button
        aria-label="Close parent details"
        className="flex-1 cursor-default"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: 420 }}
        animate={{ x: 0 }}
        exit={{ x: 420 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="flex h-full w-full max-w-[560px] flex-col overflow-hidden bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-sm">
              AY 2024-25
            </span>
            <button
              onClick={onEdit}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Edit
            </button>
            <button
              onClick={onLinkStudent}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:shadow-xl hover:shadow-primary/30"
            >
              Link Student
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-slate-100 px-8 py-8">
            <div className="flex items-start gap-4">
              <ParentAvatar name={parent.name} />
              <div className="min-w-0">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  {parentLineage}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    {parent.phone || "Not provided"}
                  </span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    {parent.email || "Not provided"}
                  </span>
                </div>
                <div className="mt-4">
                  <ParentStatusBadge
                    status={parent.status}
                    isActive={parent.isActive}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid min-h-[320px] gap-0 md:grid-cols-[0.95fr_1.05fr]">
            <section className="border-b border-slate-100 px-6 py-6 md:border-r md:border-b-0">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xs font-black tracking-[0.22em] text-slate-400 uppercase">
                  Contact Info
                </h3>
              </div>
              <div className="space-y-3">
                <DrawerInfoCard icon={User} value={parentLineage} />
                <DrawerInfoCard
                  icon={User}
                  value={
                    parent.grandfatherName?.trim()
                      ? `Grandfather: ${parent.grandfatherName}`
                      : "Grandfather: Not provided"
                  }
                />
                <DrawerInfoCard
                  icon={Phone}
                  value={parent.phone || "Not provided"}
                />
                <DrawerInfoCard
                  icon={Mail}
                  value={parent.email || "Not provided"}
                />
              </div>
            </section>

            <section className="px-6 py-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xs font-black tracking-[0.22em] text-slate-400 uppercase">
                  Linked Children
                </h3>
                <span className="text-xs font-black text-primary">
                  {linkedStudents.length} Total
                </span>
              </div>
              <div className="space-y-3">
                {linkedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-400">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">
                          {student.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onUnlink(student.id, parent.id)}
                      className="rounded-xl p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-600"
                      title="Unlink student"
                    >
                      <Link2Off className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {linkedStudents.length === 0 && (
                  <EmptyState
                    title="No linked children"
                    message="Use the link student action to attach this parent to a student."
                  />
                )}
              </div>
            </section>
          </div>
        </div>
        {!parent.isActive && (
          <div className="border-t border-slate-100 px-6 py-5">
            <button
              onClick={onInvite}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-black text-amber-700 transition hover:bg-amber-100"
            >
              <Send className="h-4 w-4" />
              Invite Parent
            </button>
          </div>
        )}
      </motion.aside>
    </motion.div>
  )
}

function DrawerInfoCard({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm font-bold text-slate-700">{value}</span>
    </div>
  )
}

function ModalFrame({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
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
          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-50"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  )
}

function ParentFormModal({
  title,
  initialValue,
  onClose,
  onSubmit,
}: {
  title: string
  initialValue: ParentFormState
  onClose: () => void
  onSubmit: (form: ParentFormState) => Promise<void>
}) {
  const [form, setForm] = useState({ ...emptyParentForm, ...initialValue })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const isInviteMode = title === "Invite Parent"
  const requiredSuffix = isInviteMode ? " *" : ""
  const emailValue = (form.email ?? "").trim()
  const phoneValue = (form.phone ?? "").trim()
  const hasInvalidEmail =
    emailValue.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)
  const hasInvalidEthiopianMobile = !/^\+2519\d{8}$/.test(phoneValue)
  useEffect(() => {
    if (!error) return
    const timeoutId = window.setTimeout(() => {
      setError(null)
    }, 4500)
    return () => window.clearTimeout(timeoutId)
  }, [error])

  return (
    <ModalFrame title={title} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()
          const nextFieldErrors: Record<string, string> = {}
          if (hasInvalidEmail) {
            nextFieldErrors.email = "Enter a valid email address."
          }
          if (!form.name.trim()) nextFieldErrors.name = "Parent name is required."
          if (!form.fatherName.trim()) {
            nextFieldErrors.fatherName = "Father name is required."
          }
          if (!form.grandfatherName.trim()) {
            nextFieldErrors.grandfatherName = "Grandfather name is required."
          }
          if (!phoneValue) {
            nextFieldErrors.phone = "Phone number is required."
          } else if (hasInvalidEthiopianMobile) {
            nextFieldErrors.phone =
              "Phone number must be in format +2519xxxxxxxx."
          }
          if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors)
            setError("Please fix the highlighted fields.")
            return
          }
          setFieldErrors({})
          setIsSubmitting(true)
          setError(null)
          try {
            await onSubmit(form)
          } catch (submitError) {
            setError(extractApiError(submitError))
          } finally {
            setIsSubmitting(false)
          }
        }}
      >
        <InputField
          label={`Parent Name${requiredSuffix}`}
          value={form.name}
          onChange={(value) => setForm({ ...form, name: value })}
          error={fieldErrors.name}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label={`Father Name${requiredSuffix}`}
            value={form.fatherName}
            onChange={(value) => setForm({ ...form, fatherName: value })}
            error={fieldErrors.fatherName}
          />
          <InputField
            label={`Grandfather Name${requiredSuffix}`}
            value={form.grandfatherName}
            onChange={(value) => setForm({ ...form, grandfatherName: value })}
            error={fieldErrors.grandfatherName}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label={`Phone Number${requiredSuffix}`}
            value={form.phone}
            onChange={(value) => setForm({ ...form, phone: value })}
            error={fieldErrors.phone}
          />
          <InputField
            label="Secondary Phone"
            value={form.secondaryPhone}
            onChange={(value) => setForm({ ...form, secondaryPhone: value })}
          />
        </div>
        <InputField
          label="Email"
          value={form.email}
          onChange={(value) => setForm({ ...form, email: value })}
          error={fieldErrors.email}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Occupation"
            value={form.occupation}
            onChange={(value) => setForm({ ...form, occupation: value })}
          />
        </div>
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
              !form.phone
            }
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white disabled:opacity-60"
          >
            {isSubmitting
              ? title === "Invite Parent"
                ? "Sending..."
                : "Saving..."
              : title === "Invite Parent"
                ? "Send Invitation"
                : "Save Parent"}
          </button>
        </div>
      </form>
    </ModalFrame>
  )
}

function LinkStudentModal({
  parent,
  students,
  onClose,
  onSubmit,
}: {
  parent: Parent
  students: Student[]
  onClose: () => void
  onSubmit: (payload: {
    studentId: string
    relationship: Parent["relationship"]
    isPrimaryContact: boolean
  }) => Promise<void>
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [studentId, setStudentId] = useState("")
  const [relationship, setRelationship] =
    useState<Parent["relationship"]>("Father")
  const [isPrimaryContact, setIsPrimaryContact] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return true
        return (
          student.name.toLowerCase().includes(query) ||
          student.rollNo.toLowerCase().includes(query)
        )
      }),
    [searchQuery, students]
  )

  return (
    <ModalFrame title="Link New Student" onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-black tracking-[0.22em] text-slate-400 uppercase">
              Select a student to link to {parent.name}
            </p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Search Student
          </label>
          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setStudentId("")
              }}
              placeholder="Search by student name or roll number..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 text-sm transition outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
          {filteredStudents.length === 0 ? (
            <div className="flex min-h-32 items-center justify-center text-center text-sm font-bold text-slate-500">
              {searchQuery.trim().length === 0
                ? "No students are available."
                : "No students match your search."}
            </div>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {filteredStudents.map((student) => {
                const isAlreadyLinkedToCurrentParent = parent.linkedStudents.includes(
                  student.id
                )
                const linkStateLabel = isAlreadyLinkedToCurrentParent
                  ? "Already linked"
                  : student.parentId
                    ? "Linked to another parent"
                    : "Unlinked"

                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() =>
                      !isAlreadyLinkedToCurrentParent && setStudentId(student.id)
                    }
                    disabled={isAlreadyLinkedToCurrentParent}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      studentId === student.id
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900">
                          {student.name}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {student.grade || "No grade"} • Section{" "}
                          {student.section || "N/A"}
                        </p>
                        <p className="mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          {student.rollNo || "No roll number"}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                          isAlreadyLinkedToCurrentParent
                            ? "bg-slate-200 text-slate-600"
                            : student.parentId
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {linkStateLabel}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <select
          value={relationship}
          onChange={(event) =>
            setRelationship(event.target.value as Parent["relationship"])
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
            disabled={!studentId || isSubmitting}
            onClick={async () => {
              setIsSubmitting(true)
              try {
                await onSubmit({ studentId, relationship, isPrimaryContact })
              } finally {
                setIsSubmitting(false)
              }
            }}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white disabled:opacity-60"
          >
            {isSubmitting ? "Linking..." : "Confirm Link"}
          </button>
        </div>
      </div>
    </ModalFrame>
  )
}

function ImportParentsModal({
  branchId,
  organizationId,
  onClose,
  onSuccess,
}: {
  branchId: string
  organizationId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessages, setErrorMessages] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [taskId, setTaskId] = useState<string | null>(null)

  return (
    <ModalFrame title="Bulk Import Parents" onClose={onClose}>
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-primary/10 bg-primary/5 shadow-sm">
          <FileText className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black tracking-tight text-slate-900">
            Bulk Parent Import
          </h3>
          <p className="text-sm font-medium text-slate-500">
            Upload Excel or CSV file to import parent directory
          </p>
        </div>
        <label className="block">
          <div className="group cursor-pointer rounded-[2rem] border-2 border-dashed border-slate-200 p-12 transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm transition-transform group-hover:scale-110">
                <ArrowUpDown className="h-6 w-6 text-slate-300 transition-colors group-hover:text-primary" />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight text-slate-900">
                  {file ? file.name : "Click or drag file to upload"}
                </p>
                <p className="mt-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
                  .xlsx, .csv supported
                </p>
              </div>
            </div>
          </div>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>
        <p className="text-xs text-slate-500">
          The backend will validate the uploaded parent file before creating
          records.
        </p>
        {(isUploading || taskId) && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-700">
                {taskId
                  ? `Import job ${taskId.slice(0, 8)}...`
                  : "Starting import..."}
              </p>
              <span className="text-xs font-black tracking-widest text-primary uppercase">
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
        {errorMessages.length > 0 && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-left text-sm text-red-700">
            <div className="space-y-1">
              {errorMessages.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-center gap-6 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-black tracking-widest text-slate-400 uppercase hover:text-slate-600"
          >
            Cancel
          </button>
          <div className="h-4 w-px bg-slate-100" />
          <button
            type="button"
            disabled={!file || isUploading}
            onClick={async () => {
              if (!file) return
              setIsUploading(true)
              setErrorMessages([])
              setProgress(25)
              setTaskId(null)
              try {
                const started = await importApi.uploadBulkFile(
                  "parents",
                  file,
                  organizationId,
                  branchId
                )
                if (!started.task_id) {
                  throw new Error("Bulk import started without a task id.")
                }
                setTaskId(started.task_id)
                setProgress(50)
                let attempts = 0
                while (attempts < 60) {
                  const job = await importApi.getStatus(started.task_id)
                  setProgress(Math.max(55, Math.min(job.progress || 0, 100)))
                  if (job.status === "success") {
                    setProgress(100)
                    onSuccess()
                    return
                  }
                  if (job.status === "failed") {
                    throw new Error(
                      extractUserReadableErrorMessages(job.errors).join("\n")
                    )
                  }
                  attempts += 1
                  await new Promise((resolve) => setTimeout(resolve, 2000))
                }
                throw new Error(
                  "Bulk import is still processing. Check again shortly."
                )
              } catch (uploadError) {
                setErrorMessages(extractUserReadableErrorMessages(uploadError))
                setTaskId(null)
                setProgress(0)
              } finally {
                setIsUploading(false)
              }
            }}
            className="text-[10px] font-black tracking-widest text-primary uppercase hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
          >
            {isUploading ? "Importing..." : "Upload File"}
          </button>
        </div>
      </div>
    </ModalFrame>
  )
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  error,
}: {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <label className="block space-y-2">
      <span
        className={`text-[10px] font-black tracking-widest uppercase ${error ? "text-red-600" : "text-slate-400"}`}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm transition outline-none focus:bg-white focus:ring-4 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-slate-200 focus:border-primary/30 focus:ring-primary/5"
        }`}
      />
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  )
}
