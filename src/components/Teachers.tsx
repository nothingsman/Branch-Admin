import React, { useDeferredValue, useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  ArrowUpDown,
  BookOpen,
  Check,
  ChevronLeft,
  FileText,
  FilePlus,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Send,
  ShieldCheck,
  User,
  Users,
  UserCheck,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import {
  ApiTeacher,
  ApiTeacherInvitePayload,
  ApiTeacherAssignment,
  ApiHomeroomAssignment,
  ApiTeacherStatus,
  PaginatedResponse,
  extractUserReadableErrorMessages,
  importApi,
  teachersApi,
} from "../lib/api"
import {
  useHomeroomAssignments,
  useTeacherAssignments,
} from "../hooks/useTeachers"
import { useTeachers, useTeacherStatuses } from "../hooks/useTeachers"
import { useApiQuery } from "../hooks/useApiQuery"
import { PhoneField } from "./ui/PhoneField"

interface TeachersProps {
  academicYear?: string
  branchId?: string | null
  organizationId?: string | null
  academicYearId?: string | null
}

type TeacherFilter = "all" | "unassigned" | "inactive"

type TeacherCardEntry = {
  teacher: ApiTeacher
  teacherDetail: ApiTeacher | null
  status: ApiTeacherStatus | null
  subjectNames: string[]
  sectionNames: string[]
  homeroomCount: number
  isUnassigned: boolean
  isInactive: boolean
  invitePayload: ApiTeacherInvitePayload | null
}

// Removed eager full-dataset loaders to reduce request fan-out.

export const Teachers: React.FC<TeachersProps> = ({
  academicYear = "Current Year",
  branchId,
  organizationId,
  academicYearId,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [teacherFilter, setTeacherFilter] = useState<TeacherFilter>("all")
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null
  )
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false)
  const [inviteActionError, setInviteActionError] = useState<string | null>(
    null
  )
  const [inviteActionMessage, setInviteActionMessage] = useState<string | null>(
    null
  )
  const [hasResolvedInitialLoad, setHasResolvedInitialLoad] = useState(false)
  const [inviteSubmittingTeacherId, setInviteSubmittingTeacherId] = useState<
    string | null
  >(null)
  const [bulkInviteSubmitting, setBulkInviteSubmitting] = useState(false)
  const deferredSearchTerm = useDeferredValue(searchTerm)

  useEffect(() => {
    if (!inviteActionError && !inviteActionMessage) return

    const timeoutId = window.setTimeout(() => {
      setInviteActionError(null)
      setInviteActionMessage(null)
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [inviteActionError, inviteActionMessage])

  const { assignments, isLoading: assignmentsLoading, error: assignmentsError } =
    useTeacherAssignments({ organizationId, academicYearId })
  const {
    homeroomAssignments,
    isLoading: homeroomLoading,
    error: homeroomError,
  } = useHomeroomAssignments({ branchId, organizationId, academicYearId })
  const {
    teachers: pagedTeachers,
    count: teacherCount,
    hasNextPage,
    hasPreviousPage,
    isLoading: teachersLoading,
    error: teachersError,
    refetch: refetchTeachers,
  } = useTeachers({
    branchId: branchId ?? null,
    organizationId: organizationId ?? null,
    page: currentPage,
    search: deferredSearchTerm.trim() || undefined,
  })
  const { statuses: teacherStatuses } = useTeacherStatuses(
    pagedTeachers.map((teacher) => teacher.id)
  )
  const filteredTeacherCards = useMemo(
    () =>
      pagedTeachers
        .map((teacher) => {
          const teacherDetail = null
                const teacherAssignments = assignments.filter(
                  (assignment) => assignment.teacher === teacher.id
                )
                const teacherHomerooms = homeroomAssignments.filter(
                  (assignment) => assignment.teacher === teacher.id
                )
                const subjectNames = [
                  ...new Set(
                    teacherAssignments
                      .map((assignment) => assignment.subject_name)
                      .filter(Boolean)
                  ),
                ]
                const sectionNames = [
                  ...new Set(
                    [
                      ...teacherAssignments.map(
                        (assignment) =>
                          `${assignment.grade_name} ${assignment.section_name}`
                      ),
                      ...teacherHomerooms.map(
                        (assignment) =>
                          `${assignment.grade_name} ${assignment.section_name}`
                      ),
                    ].filter(Boolean)
                  ),
                ]
                const status = teacherStatuses[teacher.id] ?? null
                const isInactive = status ? !status.is_active : false
                const isUnassigned =
                  teacherAssignments.length === 0 && teacherHomerooms.length === 0
                const teacherRecord = teacherDetail ?? teacher
                const invitePayload =
                  teacherRecord.user_email &&
                  teacherRecord.user_name &&
                  (teacherRecord.user_father_name || teacherRecord.father_name) &&
                  (teacherRecord.user_grandfather_name ||
                    teacherRecord.grandfather_name) &&
                  teacherRecord.user_phone_number &&
                  teacherRecord.branch
                    ? {
                        email: teacherRecord.user_email,
                        name: teacherRecord.user_name,
                        father_name:
                          teacherRecord.user_father_name ||
                          teacherRecord.father_name!,
                        grandfather_name:
                          teacherRecord.user_grandfather_name ||
                          teacherRecord.grandfather_name!,
                        phone_number: teacherRecord.user_phone_number,
                        specialization: teacherRecord.specialization || undefined,
                        branch: teacherRecord.branch,
                      }
                    : null

          return {
                  teacher,
                  teacherDetail,
                  status: teacherStatuses[teacher.id] ?? null,
                  subjectNames,
                  sectionNames,
                  homeroomCount: teacherHomerooms.length,
                  isInactive,
                  isUnassigned,
                  invitePayload,
          } satisfies TeacherCardEntry
        })
        .filter((entry) => {
      const query = deferredSearchTerm.trim().toLowerCase()
      const teacherName = (entry.teacher.user_name ?? "").toLowerCase()
      const employeeId = (entry.teacher.employee_id ?? "").toLowerCase()
      const matchesSearch =
        query.length === 0 || teacherName.includes(query) || employeeId.includes(query)
      const matchesFilter =
        teacherFilter === "all" ||
        (teacherFilter === "unassigned" && entry.isUnassigned) ||
        (teacherFilter === "inactive" && entry.isInactive)

      return matchesSearch && matchesFilter
        })
        .sort((left, right) =>
          left.teacher.user_name.localeCompare(right.teacher.user_name, undefined, {
            sensitivity: "base",
          })
        ),
    [assignments, deferredSearchTerm, homeroomAssignments, pagedTeachers, teacherFilter, teacherStatuses]
  )

  const isLoading =
    teachersLoading ||
    assignmentsLoading ||
    homeroomLoading
  const error =
    teachersError ||
    assignmentsError ||
    homeroomError
  const isInitialLoading = !hasResolvedInitialLoad && isLoading
  const isBackgroundRefreshing = hasResolvedInitialLoad && isLoading

  useEffect(() => {
    if (!isLoading) {
      setHasResolvedInitialLoad(true)
    }
  }, [isLoading])

  useEffect(() => {
    setCurrentPage(1)
  }, [branchId, organizationId])

  useEffect(() => {
    setSelectedTeacherId(null)
  }, [currentPage])
  const selectedTeacher = useMemo(
    () =>
      filteredTeacherCards.find((entry) => entry.teacher.id === selectedTeacherId) ??
      null,
    [selectedTeacherId, filteredTeacherCards]
  )

  const bulkInviteEligibleTeachers = useMemo(
    () => filteredTeacherCards.filter((entry) => entry.isInactive),
    [filteredTeacherCards]
  )

  const stats = useMemo(
    () => ({
      totalTeachers: teacherCount,
      unassignedTeachers:
        filteredTeacherCards.filter((entry) => entry.isUnassigned).length,
      inactiveTeachers: filteredTeacherCards.filter((entry) => entry.isInactive).length,
      uniqueSubjects: new Set(
        assignments.map((assignment) => assignment.subject_name).filter(Boolean)
      ).size,
    }),
    [
      assignments,
      teacherCount,
      filteredTeacherCards,
    ]
  )

  const filterOptions = useMemo(
    () => [
      { id: "all" as const, label: "All Teachers", count: teacherCount },
      {
        id: "unassigned" as const,
        label: "Unassigned",
        count: stats.unassignedTeachers,
      },
      {
        id: "inactive" as const,
        label: "Inactive",
        count: stats.inactiveTeachers,
      },
    ],
    [stats.inactiveTeachers, stats.unassignedTeachers, teacherCount]
  )

  const refreshAll = () => {
    refetchTeachers()
  }

  async function resolveInvitePayload(entry: TeacherCardEntry) {
    if (entry.invitePayload) return entry.invitePayload

    const teacherDetails =
      entry.teacherDetail ?? (await teachersApi.get(entry.teacher.id))
    if (
      !teacherDetails.user_email ||
      !teacherDetails.user_name ||
      (!teacherDetails.user_father_name && !teacherDetails.father_name) ||
      (!teacherDetails.user_grandfather_name &&
        !teacherDetails.grandfather_name) ||
      !teacherDetails.user_phone_number ||
      !teacherDetails.branch
    ) {
      throw new Error(
        `Cannot send invitation for ${entry.teacher.user_name}. Teacher invite data is incomplete.`
      )
    }

    return {
      email: teacherDetails.user_email,
      name: teacherDetails.user_name,
      father_name:
        teacherDetails.user_father_name || teacherDetails.father_name!,
      grandfather_name:
        teacherDetails.user_grandfather_name ||
        teacherDetails.grandfather_name!,
      phone_number: teacherDetails.user_phone_number,
      specialization: teacherDetails.specialization || undefined,
      branch: teacherDetails.branch,
    }
  }

  async function handleInviteTeacher(entry: TeacherCardEntry) {
    setInviteSubmittingTeacherId(entry.teacher.id)
    setInviteActionError(null)
    setInviteActionMessage(null)
    try {
      const invitePayload = await resolveInvitePayload(entry)
      await teachersApi.invite(invitePayload)
      setInviteActionMessage(`Invitation sent to ${entry.teacher.user_name}.`)
      refreshAll()
    } catch (submitError) {
      setInviteActionError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to send teacher invitation."
      )
    } finally {
      setInviteSubmittingTeacherId(null)
    }
  }

  async function handleBulkInvite() {
    if (bulkInviteEligibleTeachers.length === 0) return
    setBulkInviteSubmitting(true)
    setInviteActionError(null)
    setInviteActionMessage(null)
    try {
      const results = await Promise.allSettled(
        bulkInviteEligibleTeachers.map(async (entry) => {
          const invitePayload = await resolveInvitePayload(entry)
          await teachersApi.invite(invitePayload)
          return entry.teacher.user_name
        })
      )

      const successCount = results.filter(
        (result) => result.status === "fulfilled"
      ).length
      const failureCount = results.length - successCount

      if (successCount === 0) {
        const firstFailure = results.find(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected"
        )
        throw firstFailure?.reason instanceof Error
          ? firstFailure.reason
          : new Error("Failed to bulk invite inactive teachers.")
      }

      setInviteActionMessage(
        `Bulk invite sent to ${successCount} inactive teacher${
          successCount === 1 ? "" : "s"
        }.` +
          (failureCount > 0 ? ` ${failureCount} failed and were skipped.` : "")
      )
      setShowBulkInviteModal(false)
      refreshAll()
    } catch (submitError) {
      setInviteActionError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to bulk invite teachers."
      )
    } finally {
      setBulkInviteSubmitting(false)
    }
  }

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            Loading teachers
          </p>
        </div>
      </div>
    )
  }

  if (error && !hasResolvedInitialLoad) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
          <p className="font-bold text-red-700">Failed to load teachers</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="sticky top-0 z-20 border-b border-slate-100 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Teachers
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Academic year {academicYear}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isBackgroundRefreshing && (
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Updating
                </div>
              )}
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary"
              >
                <FilePlus className="h-4 w-4" />
                Bulk Import
              </button>
              <button
                onClick={() => setShowBulkInviteModal(true)}
                disabled={bulkInviteEligibleTeachers.length === 0}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 disabled:cursor-not-allowed disabled:bg-amber-200 disabled:shadow-none"
              >
                <Mail className="h-4 w-4" />
                Bulk Invite ({bulkInviteEligibleTeachers.length})
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                Invite Teacher
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Teachers"
              value={stats.totalTeachers}
              icon={Users}
            />
            <StatCard
              label="Unassigned"
              value={stats.unassignedTeachers}
              icon={ShieldCheck}
            />
            <StatCard
              label="Inactive"
              value={stats.inactiveTeachers}
              icon={User}
            />
            <StatCard
              label="Subjects Covered"
              value={stats.uniqueSubjects}
              icon={BookOpen}
            />
          </div>

          <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTeacherFilter(option.id)}
                  className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                    teacherFilter === option.id
                      ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {option.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        teacherFilter === option.id
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {option.count}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search teachers by name or employee ID"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 text-sm outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5"
              />
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
              <div className="flex items-center gap-2">
                {inviteActionError ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>{inviteActionError ?? inviteActionMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-5xl">
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            {error && (
              <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-3">
              {filteredTeacherCards.map((entry) => (
                <div
                  key={entry.teacher.id}
                  className={`flex items-start gap-4 rounded-2xl border p-4 transition ${
                    selectedTeacherId === entry.teacher.id
                      ? "border-primary/30 bg-primary/5"
                      : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <button
                    onClick={() => setSelectedTeacherId(entry.teacher.id)}
                    className="flex min-w-0 flex-1 items-start gap-4 text-left"
                  >
                    <TeacherAvatar name={entry.teacher.user_name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {[
                            entry.teacher.user_name,
                            entry.teacherDetail?.user_father_name ??
                              entry.teacher.father_name,
                            entry.teacherDetail?.user_grandfather_name ??
                              entry.teacher.grandfather_name,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        </p>
                        <TeacherStatusBadge isInactive={entry.isInactive} />
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                          {entry.teacher.employee_id}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {entry.teacher.user_email}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {entry.subjectNames.slice(0, 3).map((subject) => (
                          <Tag key={subject}>{subject}</Tag>
                        ))}
                        {entry.subjectNames.length === 0 && (
                          <Tag>No subject assignments</Tag>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {entry.sectionNames.length}
                      </p>
                      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        sections
                      </p>
                    </div>
                  </button>
                  {entry.isInactive && (
                    <button
                      onClick={() => handleInviteTeacher(entry)}
                      disabled={inviteSubmittingTeacherId === entry.teacher.id}
                      title="Send teacher reinvite"
                      className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {inviteSubmittingTeacherId === entry.teacher.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              ))}
              {filteredTeacherCards.length === 0 && (
                <EmptyState message="No teachers match the current search or filter." />
              )}
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-slate-500">
                Page {currentPage} · {teacherCount} total teacher
                {teacherCount === 1 ? "" : "s"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={!hasPreviousPage}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => page + 1)}
                  disabled={!hasNextPage}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {selectedTeacher && (
          <TeacherDetailDrawer
            entry={selectedTeacher}
            onClose={() => setSelectedTeacherId(null)}
          />
        )}
        {showInviteModal && branchId && (
          <InviteTeacherModal
            branchId={branchId}
            onClose={() => setShowInviteModal(false)}
            onSuccess={(message) => {
              setShowInviteModal(false)
              setInviteActionError(null)
              setInviteActionMessage(message)
              refreshAll()
            }}
          />
        )}
        {showBulkInviteModal && (
          <BulkInviteModal
            count={bulkInviteEligibleTeachers.length}
            isSubmitting={bulkInviteSubmitting}
            onClose={() => {
              if (!bulkInviteSubmitting) {
                setShowBulkInviteModal(false)
              }
            }}
            onConfirm={handleBulkInvite}
          />
        )}
        {showImportModal && branchId && organizationId && (
          <ImportTeachersModal
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

function TeacherDetailDrawer({
  entry,
  onClose,
}: {
  entry: TeacherCardEntry
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex justify-end bg-slate-950/35 backdrop-blur-[1px]"
    >
      <button
        aria-label="Close teacher details"
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
          <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase shadow-sm">
            Teacher Profile
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-slate-100 px-8 py-8">
            <div className="flex items-start gap-4">
              <TeacherAvatar name={entry.teacher.user_name} large />
              <div className="min-w-0">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {entry.teacher.user_name}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    {entry.teacher.user_email}
                  </span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    {entry.teacherDetail?.user_phone_number ||
                      "Phone not provided"}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <TeacherStatusBadge isInactive={entry.isInactive} />
                  <span className="text-sm font-medium text-slate-500">
                    {entry.teacher.specialization || "No specialization set"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid min-h-[320px] gap-0 md:grid-cols-[0.95fr_1.05fr]">
            <section className="border-b border-slate-100 px-6 py-6 md:border-r md:border-b-0">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-[0.22em] text-slate-400 uppercase">
                  Contact Info
                </h3>
              </div>
              <div className="space-y-3">
                <DrawerInfoCard
                  icon={Mail}
                  value={entry.teacher.user_email || "Not provided"}
                />
                <DrawerInfoCard
                  icon={Phone}
                  value={
                    entry.teacherDetail?.user_phone_number ||
                    "Phone not provided"
                  }
                />
                <DrawerInfoCard
                  icon={User}
                  value={entry.teacher.employee_id || "No employee ID"}
                />
                <DrawerInfoCard
                  icon={ShieldCheck}
                  value={`Homeroom assignments: ${entry.homeroomCount}`}
                />
                <DrawerInfoCard
                  icon={UserCheck}
                  value={`Account status: ${
                    entry.status?.is_active ? "Active" : "Inactive"
                  }`}
                />
                <DrawerInfoCard
                  icon={BookOpen}
                  value={entry.teacher.joining_date || "Joining date not set"}
                />
                <DrawerInfoCard
                  icon={UserCheck}
                  value={formatTeacherVerification(entry.status?.verified_at)}
                />
              </div>
            </section>

            <section className="px-6 py-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-[0.22em] text-slate-400 uppercase">
                  Subjects
                </h3>
                <span className="text-xs font-bold text-primary">
                  {entry.subjectNames.length} Total
                </span>
              </div>
              <div className="space-y-3">
                {entry.subjectNames.length > 0 ? (
                  entry.subjectNames.map((subject) => (
                    <div
                      key={subject}
                      className="rounded-3xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm"
                    >
                      {subject}
                    </div>
                  ))
                ) : (
                  <EmptyState message="No subject assignments yet." />
                )}
              </div>

              <div className="mt-8 mb-5 flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-[0.22em] text-slate-400 uppercase">
                  Assigned Sections
                </h3>
                <span className="text-xs font-bold text-primary">
                  {entry.sectionNames.length} Total
                </span>
              </div>
              <div className="space-y-3">
                {entry.sectionNames.length > 0 ? (
                  entry.sectionNames.map((section) => (
                    <div
                      key={section}
                      className="rounded-3xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm"
                    >
                      {section}
                    </div>
                  ))
                ) : (
                  <EmptyState message="No section assignments yet." />
                )}
              </div>
            </section>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  )
}

function InviteTeacherModal({
  branchId,
  onClose,
  onSuccess,
}: {
  branchId: string
  onClose: () => void
  onSuccess: (message: string) => void
}) {
  const [name, setName] = useState("")
  const [fatherName, setFatherName] = useState("")
  const [grandfatherName, setGrandfatherName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <ModalFrame title="Invite Teacher" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          Send an invitation email so the teacher can set a password and
          activate their account.
        </div>
        <InputField
          label="Teacher Name"
          value={name}
          onChange={setName}
          required
        />
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Father Name"
            value={fatherName}
            onChange={setFatherName}
            required
          />
          <InputField
            label="Grandfather Name"
            value={grandfatherName}
            onChange={setGrandfatherName}
            required
          />
        </div>
        <InputField
          label="Email"
          value={email}
          onChange={setEmail}
          required
        />
        <PhoneField
          label="Phone Number"
          value={phoneNumber}
          onChange={setPhoneNumber}
          required
        />
        <InputField
          label="Specialization"
          value={specialization}
          onChange={setSpecialization}
        />

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
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
              !phoneNumber
            }
            onClick={async () => {
              setIsSubmitting(true)
              setError(null)
              try {
                const response = await teachersApi.invite({
                  email,
                  name,
                  father_name: fatherName,
                  grandfather_name: grandfatherName,
                  phone_number: phoneNumber,
                  specialization: specialization || undefined,
                  branch: branchId,
                })
                onSuccess(
                  response.message || "Teacher invitation sent successfully."
                )
              } catch (submitError) {
                setError(
                  submitError instanceof Error
                    ? submitError.message
                    : "Failed to send teacher invitation."
                )
              } finally {
                setIsSubmitting(false)
              }
            }}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </ModalFrame>
  )
}

function BulkInviteModal({
  count,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  count: number
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  return (
    <ModalFrame title="Bulk Invite Teachers" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          Send invitations to {count} inactive teacher{count === 1 ? "" : "s"}{" "}
          in the current filtered view.
        </div>
        <p className="text-sm text-slate-500">
          This action only targets inactive teachers currently visible in the
          directory filter.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={count === 0 || isSubmitting}
            className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {isSubmitting
              ? "Sending..."
              : `Send ${count} Invite${count === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </ModalFrame>
  )
}

function ImportTeachersModal({
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
    <ModalFrame title="Bulk Import Teachers" onClose={onClose}>
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-primary/10 bg-primary/5 shadow-sm">
          <FileText className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            Bulk Teacher Import
          </h3>
          <p className="text-sm font-medium text-slate-500">
            Upload Excel or CSV file to import teacher directory
          </p>
        </div>
        <label className="block">
          <div className="group cursor-pointer rounded-[2rem] border-2 border-dashed border-slate-200 p-12 transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm transition-transform group-hover:scale-110">
                <ArrowUpDown className="h-6 w-6 text-slate-300 transition-colors group-hover:text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight text-slate-900">
                  {file ? file.name : "Click or drag file to upload"}
                </p>
                <p className="mt-1 text-xs font-semibold tracking-widest text-slate-400 uppercase">
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
          The backend will validate the uploaded teacher file before creating
          records.
        </p>
        {(isUploading || taskId) && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">
                {taskId
                  ? `Import job ${taskId.slice(0, 8)}...`
                  : "Starting import..."}
              </p>
              <span className="text-xs font-bold tracking-widest text-primary uppercase">
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
            className="text-[10px] font-bold tracking-widest text-slate-400 uppercase hover:text-slate-600"
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
                  "teachers",
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
            className="text-[10px] font-bold tracking-widest text-primary uppercase hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
          >
            {isUploading ? "Importing..." : "Upload File"}
          </button>
        </div>
      </div>
    </ModalFrame>
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
        className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
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
      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

function TeacherAvatar({
  name,
  large = false,
}: {
  name: string
  large?: boolean
}) {
  const size = large ? "h-20 w-20 text-2xl" : "h-11 w-11 text-xs"
  return (
    <div
      className={`flex ${size} items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-bold text-slate-500`}
    >
      {name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)}
    </div>
  )
}

function TeacherStatusBadge({ isInactive }: { isInactive: boolean }) {
  const classes = isInactive
    ? "border-amber-100 bg-amber-50 text-amber-700"
    : "border-emerald-100 bg-emerald-50 text-emerald-700"

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${classes}`}
    >
      {isInactive ? "Inactive" : "Active"}
    </span>
  )
}

function formatTeacherVerification(verifiedAt?: string | null) {
  if (!verifiedAt) return "User verification pending"

  const parsedDate = new Date(verifiedAt)
  if (Number.isNaN(parsedDate.getTime())) {
    return `Verified at ${verifiedAt}`
  }

  return `Verified ${parsedDate.toLocaleString()}`
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold tracking-widest text-slate-600 uppercase">
      {children}
    </span>
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
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  )
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
      />
    </label>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
      {message}
    </div>
  )
}
