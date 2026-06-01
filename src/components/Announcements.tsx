import React, { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Clock,
  Edit3,
  ExternalLink,
  Loader2,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { MediaUploader, MediaUploaderState } from "./MediaUploader"
import { deleteQueuedMedia } from "../lib/media/deleteQueuedMedia"
import { resolveMediaUrl } from "../lib/media/resolveMediaUrl"
import { format, parseISO } from "date-fns"
import {
  announcementsApi,
  ApiAnnouncement,
  ApiAnnouncementTargetingCriteria,
  ApiAnnouncementWrite,
  PaginatedResponse,
} from "../lib/api"
import { useApiQuery } from "../hooks/useApiQuery"

interface AnnouncementsProps {
  branchId: string | null
  organizationId: string | null
  academicYearId: string | null
}

type AnnouncementDraftState = {
  subject: string
  message: string
  targetRoles: ApiAnnouncementWrite["target_roles"]
  targetedGradeIds: string[]
  targetedSectionIds: string[]
  isUrgent: boolean
  scheduledAt: string
}

const emptyDraft: AnnouncementDraftState = {
  subject: "",
  message: "",
  targetRoles: "BOTH",
  targetedGradeIds: [],
  targetedSectionIds: [],
  isUrgent: false,
  scheduledAt: "",
}

const emptyMediaUploaderState: MediaUploaderState = {
  hasChanges: false,
  mediaId: null,
  pendingRemovalIds: [],
}

export const Announcements: React.FC<AnnouncementsProps> = ({
  branchId,
  organizationId,
  academicYearId,
}) => {
  void academicYearId

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "all" | "DRAFT" | "SENT" | "SCHEDULED" | "urgent"
  >("all")
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    string | null
  >(null)
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<ApiAnnouncement | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)

  const {
    data: targetingCriteria,
    isLoading: targetingLoading,
    error: targetingError,
  } = useApiQuery<ApiAnnouncementTargetingCriteria>(
    branchId && organizationId
      ? () => announcementsApi.getTargetingCriteria()
      : null,
    [branchId, organizationId]
  )

  const {
    data,
    isLoading: announcementsLoading,
    error: announcementsError,
    refetch,
  } = useApiQuery<PaginatedResponse<ApiAnnouncement>>(
    branchId && organizationId
      ? () =>
          announcementsApi.list({
            branch: branchId,
            organization: organizationId,
            ordering: "-created_at",
          })
      : null,
    [branchId, organizationId]
  )

  const grades = targetingCriteria?.grades ?? []
  const sections = targetingCriteria?.sections ?? []
  const announcements = useMemo(() => data?.results ?? [], [data])
  const selectedAnnouncement = useMemo(
    () =>
      announcements.find(
        (announcement) => announcement.id === selectedAnnouncementId
      ) ?? null,
    [announcements, selectedAnnouncementId]
  )

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const matchesSearch =
        announcement.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipientLabel(announcement, grades, sections)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      if (statusFilter === "all") return matchesSearch
      if (statusFilter === "urgent")
        return matchesSearch && announcement.is_urgent
      return matchesSearch && announcement.status === statusFilter
    })
  }, [announcements, grades, searchTerm, sections, statusFilter])

  const stats = useMemo(
    () => ({
      total: announcements.length,
      sent: announcements.filter(
        (announcement) => announcement.status === "SENT"
      ).length,
      scheduled: announcements.filter(
        (announcement) => announcement.status === "SCHEDULED"
      ).length,
      drafts: announcements.filter(
        (announcement) => announcement.status === "DRAFT"
      ).length,
    }),
    [announcements]
  )

  const isLoading = targetingLoading || announcementsLoading
  const error = targetingError || announcementsError

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            Loading announcements
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
          <p className="font-bold text-red-700">
            Failed to load announcements
          </p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Announcements
              </h1>
              <p className="text-sm text-slate-500">
                Manage school-wide and targeted communications
              </p>
            </div>
            <button
              onClick={() => {
                setEditingAnnouncement(null)
                setComposerOpen(true)
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              New Announcement
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <StatCard label="All" value={stats.total} />
            <StatCard label="Sent" value={stats.sent} />
            <StatCard label="Scheduled" value={stats.scheduled} />
            <StatCard label="Drafts" value={stats.drafts} />
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search announcements"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 text-sm outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {(["all", "SENT", "SCHEDULED", "DRAFT", "urgent"] as const).map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`rounded-xl px-4 py-3 text-xs font-bold tracking-widest uppercase ${
                        statusFilter === filter
                          ? "bg-primary text-white"
                          : "border border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {filter === "all" ? "All" : filter}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {filteredAnnouncements.map((announcement) => (
                <button
                  key={announcement.id}
                  onClick={() => setSelectedAnnouncementId(announcement.id)}
                  className={`w-full rounded-2xl border p-5 text-left transition ${
                    selectedAnnouncementId === announcement.id
                      ? "border-primary/30 bg-primary/5"
                      : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <AnnouncementBadge
                          label={recipientLabel(announcement, grades, sections)}
                        />
                        <StatusBadge
                          status={announcement.status}
                          urgent={announcement.is_urgent}
                        />
                      </div>
                      <h2 className="mt-3 text-lg font-bold text-slate-900">
                        {announcement.subject}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                        {announcement.message}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm font-semibold text-slate-700">
                        {displayDate(announcement)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              {filteredAnnouncements.length === 0 && (
                <EmptyState message="No announcements match the current filters." />
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedAnnouncement && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-slate-950/40"
              onClick={() => setSelectedAnnouncementId(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 z-[100] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Announcement Details
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {recipientLabel(selectedAnnouncement, grades, sections)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAnnouncementId(null)}
                  className="rounded-xl p-2 hover:bg-slate-50"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 space-y-5 overflow-y-auto p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      status={selectedAnnouncement.status}
                      urgent={selectedAnnouncement.is_urgent}
                    />
                    <AnnouncementBadge
                      label={audienceLabel(selectedAnnouncement.target_roles)}
                    />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-slate-900">
                    {selectedAnnouncement.subject}
                  </h3>
                  <p className="mt-4 text-sm leading-6 whitespace-pre-wrap text-slate-600">
                    {selectedAnnouncement.message}
                  </p>
                </div>
                <div className="grid gap-3">
                  <DetailCard
                    label="Audience"
                    value={audienceLabel(selectedAnnouncement.target_roles)}
                  />
                  <DetailCard
                    label="Target Scope"
                    value={recipientLabel(
                      selectedAnnouncement,
                      grades,
                      sections
                    )}
                  />
                  <DetailCard
                    label="Target Grade"
                    value={targetGradeLabel(selectedAnnouncement, grades)}
                  />
                  <DetailCard
                    label="Target Sections"
                    value={targetSectionsLabel(selectedAnnouncement, sections)}
                  />
                  <DetailCard
                    label="Delivery"
                    value={deliveryLabel(selectedAnnouncement)}
                  />
                  <DetailCard
                    label="Urgency"
                    value={
                      selectedAnnouncement.is_urgent ? "Urgent" : "Normal"
                    }
                  />
                </div>
                {selectedAnnouncement.attachment && (
                  <ResolvedMediaLink
                    mediaId={selectedAnnouncement.attachment}
                    label="View attachment"
                  />
                )}
              </div>
              <div className="border-t border-slate-100 bg-slate-50 p-5">
                <div
                  className={`grid gap-3 ${
                    selectedAnnouncement.status === "SENT"
                      ? "grid-cols-1"
                      : "grid-cols-2"
                  }`}
                >
                  {selectedAnnouncement.status !== "SENT" && (
                    <button
                      onClick={() => {
                        setEditingAnnouncement(selectedAnnouncement)
                        setComposerOpen(true)
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      await announcementsApi.delete(selectedAnnouncement.id)
                      setSelectedAnnouncementId(null)
                      refetch()
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {composerOpen && branchId && organizationId && (
          <AnnouncementComposer
            branchId={branchId}
            organizationId={organizationId}
            grades={grades}
            sections={sections}
            initialAnnouncement={editingAnnouncement}
            onClose={() => {
              setComposerOpen(false)
              setEditingAnnouncement(null)
            }}
            onSuccess={() => {
              setComposerOpen(false)
              setEditingAnnouncement(null)
              refetch()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function AnnouncementComposer({
  branchId,
  organizationId,
  grades,
  sections,
  initialAnnouncement,
  onClose,
  onSuccess,
}: {
  branchId: string
  organizationId: string
  grades: ApiAnnouncementTargetingCriteria["grades"]
  sections: ApiAnnouncementTargetingCriteria["sections"]
  initialAnnouncement: ApiAnnouncement | null
  onClose: () => void
  onSuccess: () => void
}) {
  type AnnouncementValidationErrors = {
    subject?: string
    message?: string
    scheduledAt?: string
  }

  const sortedGrades = useMemo(
    () =>
      [...grades].sort(
        (left, right) =>
          left.level - right.level ||
          left.name.localeCompare(right.name, undefined, {
            sensitivity: "base",
            numeric: true,
          })
      ),
    [grades]
  )
  const [draft, setDraft] = useState<AnnouncementDraftState>(
    initialAnnouncement
      ? {
          subject: initialAnnouncement.subject,
          message: initialAnnouncement.message,
          targetRoles: initialAnnouncement.target_roles,
          targetedGradeIds: initialAnnouncement.targeted_grades ?? [],
          targetedSectionIds: initialAnnouncement.targeted_sections ?? [],
          isUrgent: initialAnnouncement.is_urgent,
          scheduledAt: toDateTimeLocal(initialAnnouncement.scheduled_at ?? ""),
        }
      : emptyDraft
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] =
    useState<AnnouncementValidationErrors>({})
  const [attachmentState, setAttachmentState] = useState<MediaUploaderState>(
    emptyMediaUploaderState
  )
  const [isAttachmentBusy, setIsAttachmentBusy] = useState(false)

  const initialAttachmentId = initialAnnouncement?.attachment ?? null
  const selectedGradeId = draft.targetedGradeIds[0] ?? ""
  const selectedGrade = useMemo(
    () => sortedGrades.find((grade) => grade.id === selectedGradeId) ?? null,
    [selectedGradeId, sortedGrades]
  )
  const sectionsForSelectedGrade = useMemo(() => {
    if (!selectedGrade) return []

    return [...sections]
      .filter((section) => section.grade_name === selectedGrade.name)
      .sort((left, right) =>
        left.name.localeCompare(right.name, undefined, {
          sensitivity: "base",
          numeric: true,
        })
      )
  }, [sections, selectedGrade])

  useEffect(() => {
    if (!selectedGrade) {
      if (draft.targetedSectionIds.length === 0) return
      setDraft((current) => ({
        ...current,
        targetedSectionIds: [],
      }))
      return
    }

    const allowedSectionIds = new Set(
      sectionsForSelectedGrade.map((section) => section.id)
    )
    const filteredSectionIds = draft.targetedSectionIds.filter((sectionId) =>
      allowedSectionIds.has(sectionId)
    )

    if (filteredSectionIds.length === draft.targetedSectionIds.length) return

    setDraft((current) => ({
      ...current,
      targetedSectionIds: filteredSectionIds,
    }))
  }, [draft.targetedSectionIds, sectionsForSelectedGrade, selectedGrade])

  function toggleTargetSection(sectionId: string, checked: boolean) {
    setDraft((current) => ({
      ...current,
      targetedSectionIds: checked
        ? [...current.targetedSectionIds, sectionId]
        : current.targetedSectionIds.filter((id) => id !== sectionId),
    }))
  }

  function validateDraft(
    status: ApiAnnouncementWrite["status"]
  ): AnnouncementValidationErrors {
    const errors: AnnouncementValidationErrors = {}

    if (!draft.subject.trim()) {
      errors.subject = "Subject is required."
    }

    if (!draft.message.trim()) {
      errors.message = "Message is required."
    }

    if (status === "SCHEDULED" && !draft.scheduledAt) {
      errors.scheduledAt =
        "Select a scheduled time before scheduling this announcement."
    }

    return errors
  }

  function setFieldValue<K extends keyof AnnouncementDraftState>(
    field: K,
    value: AnnouncementDraftState[K]
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }))

    if (field === "subject" || field === "message" || field === "scheduledAt") {
      const validationField = field as keyof AnnouncementValidationErrors
      setValidationErrors((current) => {
        if (!current[validationField]) return current
        return {
          ...current,
          [validationField]: undefined,
        }
      })
    }
  }

  async function handleClose() {
    if (isSubmitting || isAttachmentBusy) {
      return
    }

    try {
      const mediaIdsToDelete = new Set<string>()

      if (
        attachmentState.mediaId &&
        attachmentState.mediaId !== initialAttachmentId
      ) {
        mediaIdsToDelete.add(attachmentState.mediaId)
      }

      if (mediaIdsToDelete.size > 0) {
        await deleteQueuedMedia([...mediaIdsToDelete])
      }
    } finally {
      setAttachmentState(emptyMediaUploaderState)
      onClose()
    }
  }

  async function submit(status: ApiAnnouncementWrite["status"]) {
    const errors = validateDraft(status)
    setValidationErrors(errors)
    setSubmitError(null)

    if (Object.values(errors).some(Boolean)) {
      return
    }

    setIsSubmitting(true)

    const payload: ApiAnnouncementWrite = {
      organization: organizationId,
      branch: branchId,
      subject: draft.subject.trim(),
      message: draft.message.trim(),
      status,
      is_urgent: draft.isUrgent,
      target_roles: draft.targetRoles,
      targeted_grades: draft.targetedGradeIds,
      targeted_sections: draft.targetedSectionIds,
      attachment: attachmentState.mediaId,
      scheduled_at:
        status === "SCHEDULED" && draft.scheduledAt
          ? new Date(draft.scheduledAt).toISOString()
          : null,
    }

    try {
      if (initialAnnouncement) {
        await announcementsApi.update(initialAnnouncement.id, payload)
      } else {
        await announcementsApi.create(payload)
      }
      await deleteQueuedMedia(attachmentState.pendingRemovalIds)
      setAttachmentState(emptyMediaUploaderState)
      onSuccess()
    } catch (submitError) {
      setSubmitError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save announcement."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialAnnouncement
                ? "Edit Announcement"
                : "Compose Announcement"}
            </h2>
            <p className="text-xs text-slate-500">
              Target grades and sections using the live backend criteria.
            </p>
          </div>
          <button
            onClick={() => void handleClose()}
            className="rounded-xl p-2 hover:bg-slate-50"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Audience">
              <select
                value={draft.targetRoles}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    targetRoles: event.target
                      .value as AnnouncementDraftState["targetRoles"],
                  })
                }
                className="field"
              >
                <option value="BOTH">Parents and Teachers</option>
                <option value="PARENTS">Parents Only</option>
                <option value="TEACHERS">Teachers Only</option>
              </select>
            </Field>
            <Field
              label="Scheduled Time"
              required={Boolean(validationErrors.scheduledAt)}
              error={validationErrors.scheduledAt}
            >
              <input
                type="datetime-local"
                value={draft.scheduledAt}
                onChange={(event) =>
                  setFieldValue("scheduledAt", event.target.value)
                }
                className={`field ${
                  validationErrors.scheduledAt
                    ? "border-red-300 bg-red-50/60 focus:border-red-300 focus:ring-red-100"
                    : ""
                }`}
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Target Grades">
              <select
                value={selectedGradeId}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    targetedGradeIds: event.target.value
                      ? [event.target.value]
                      : [],
                    targetedSectionIds: [],
                  })
                }
                className="field"
              >
                <option value="">All grades</option>
                {sortedGrades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Target Sections">
              <div className="min-h-[140px] rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {!selectedGrade ? (
                  <div className="flex h-full min-h-[112px] items-center justify-center text-center text-sm font-medium text-slate-400">
                    Select a grade first to choose sections.
                  </div>
                ) : sectionsForSelectedGrade.length === 0 ? (
                  <div className="flex h-full min-h-[112px] items-center justify-center text-center text-sm font-medium text-slate-400">
                    No sections are available for this grade.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sectionsForSelectedGrade.map((section) => (
                      <label
                        key={section.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                      >
                        <input
                          type="checkbox"
                          checked={draft.targetedSectionIds.includes(section.id)}
                          onChange={(event) =>
                            toggleTargetSection(section.id, event.target.checked)
                          }
                        />
                        <span className="text-sm font-semibold text-slate-700">
                          Section {section.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </Field>
          </div>

          <p className="text-xs text-slate-500">
            Leave grade empty to send to the full selected audience. Once a
            grade is selected, only sections in that grade are shown.
          </p>

          <Field
            label="Subject"
            required
            error={validationErrors.subject}
          >
            <input
              value={draft.subject}
              onChange={(event) =>
                setFieldValue("subject", event.target.value)
              }
              className={`field ${
                validationErrors.subject
                  ? "border-red-300 bg-red-50/60 focus:border-red-300 focus:ring-red-100"
                  : ""
              }`}
            />
          </Field>
          <Field
            label="Message"
            required
            error={validationErrors.message}
          >
            <textarea
              rows={5}
              value={draft.message}
              onChange={(event) =>
                setFieldValue("message", event.target.value)
              }
              className={`field min-h-[140px] ${
                validationErrors.message
                  ? "border-red-300 bg-red-50/60 focus:border-red-300 focus:ring-red-100"
                  : ""
              }`}
            />
          </Field>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={draft.isUrgent}
              onChange={(event) =>
                setDraft({ ...draft, isUrgent: event.target.checked })
              }
            />
            <span className="text-sm font-semibold text-slate-700">
              Mark as urgent
            </span>
          </label>

          <MediaUploader
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
            label="Attachment"
            description="Attach an image or document"
            initialMediaId={initialAttachmentId}
            onUploaded={(mediaId) =>
              setAttachmentState((current) => ({
                ...current,
                mediaId,
              }))
            }
            onRemoved={() =>
              setAttachmentState((current) => ({
                ...current,
                mediaId: null,
              }))
            }
            onStateChange={setAttachmentState}
            onBusyChange={setIsAttachmentBusy}
          />

          {submitError && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5">
          <button
            type="button"
            onClick={() => submit("DRAFT")}
            disabled={isSubmitting || isAttachmentBusy}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-60"
          >
            Save Draft
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isSubmitting || isAttachmentBusy}
              onClick={() => submit("SCHEDULED")}
              className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary disabled:opacity-60"
            >
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule
              </span>
            </button>
            <button
              type="button"
              disabled={isSubmitting || isAttachmentBusy}
              onClick={() => submit("SENT")}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                {isSubmitting ? "Saving..." : "Send"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Field({
  label,
  required = false,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
        {label}
        {required ? (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      {children}
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </label>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

function AnnouncementBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold tracking-widest text-primary uppercase">
      <Users className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

function StatusBadge({
  status,
  urgent,
}: {
  status: ApiAnnouncement["status"]
  urgent: boolean
}) {
  if (urgent) {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold tracking-widest text-red-700 uppercase">
        Urgent
      </span>
    )
  }

  const styles =
    status === "SENT"
      ? "bg-emerald-50 text-emerald-700"
      : status === "SCHEDULED"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600"

  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase ${styles}`}
    >
      {status}
    </span>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
      {message}
    </div>
  )
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-700">{value}</p>
    </div>
  )
}

function ResolvedMediaLink({
  mediaId,
  label,
}: {
  mediaId: string
  label: string
}) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    resolveMediaUrl(mediaId)
      .then((url) => {
        if (!cancelled) {
          setResolvedUrl(url)
        }
      })
      .catch((error) => {
        console.error("Failed to resolve attachment URL:", error)
      })

    return () => {
      cancelled = true
    }
  }, [mediaId])

  if (!resolvedUrl) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
        Attachment available, but the download link could not be resolved.
      </div>
    )
  }

  return (
    <a
      href={resolvedUrl}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-700 transition hover:border-primary/20 hover:text-primary"
    >
      <span>{label}</span>
      <ExternalLink className="h-4 w-4" />
    </a>
  )
}

function displayDate(announcement: ApiAnnouncement) {
  const value =
    announcement.scheduled_at ??
    announcement.updated_at ??
    announcement.created_at

  if (!value) return "Unknown date"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return format(date, "MMM d, yyyy HH:mm")
}

function audienceLabel(audience: ApiAnnouncement["target_roles"]) {
  if (audience === "PARENTS") return "Parents Only"
  if (audience === "TEACHERS") return "Teachers Only"
  return "Parents and Teachers"
}

function recipientLabel(
  announcement: ApiAnnouncement,
  grades: ApiAnnouncementTargetingCriteria["grades"],
  sections: ApiAnnouncementTargetingCriteria["sections"]
) {
  const gradeLabels = announcement.targeted_grades
    .map((gradeId) => grades.find((grade) => grade.id === gradeId)?.name)
    .filter((value): value is string => Boolean(value))
  const sectionLabels = announcement.targeted_sections
    .map((sectionId) => {
      const section = sections.find((item) => item.id === sectionId)
      return section ? `${section.grade_name} - Section ${section.name}` : null
    })
    .filter((value): value is string => Boolean(value))

  if (gradeLabels.length === 0 && sectionLabels.length === 0) {
    if (announcement.target_roles === "PARENTS") return "All Parents"
    if (announcement.target_roles === "TEACHERS") return "All Teachers"
    return "Whole School"
  }

  return [...gradeLabels, ...sectionLabels].join(", ")
}

function targetGradeLabel(
  announcement: ApiAnnouncement,
  grades: ApiAnnouncementTargetingCriteria["grades"]
) {
  const gradeLabels = announcement.targeted_grades
    .map((gradeId) => grades.find((grade) => grade.id === gradeId)?.name)
    .filter((value): value is string => Boolean(value))

  return gradeLabels.length > 0 ? gradeLabels.join(", ") : "All grades"
}

function targetSectionsLabel(
  announcement: ApiAnnouncement,
  sections: ApiAnnouncementTargetingCriteria["sections"]
) {
  const sectionLabels = announcement.targeted_sections
    .map((sectionId) => {
      const section = sections.find((item) => item.id === sectionId)
      return section ? `Section ${section.name}` : null
    })
    .filter((value): value is string => Boolean(value))

  return sectionLabels.length > 0
    ? sectionLabels.join(", ")
    : "All sections in audience scope"
}

function deliveryLabel(announcement: ApiAnnouncement) {
  if (announcement.status === "SCHEDULED" && announcement.scheduled_at) {
    return `Scheduled for ${format(parseISO(announcement.scheduled_at), "MMM d, yyyy HH:mm")}`
  }

  if (announcement.status === "SENT") {
    return `Sent ${displayDate(announcement)}`
  }

  return `Created ${displayDate(announcement)}`
}

function toDateTimeLocal(value: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16)
}
