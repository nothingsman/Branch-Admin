import React, { useEffect, useMemo, useState } from "react"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  LayoutGrid,
  FileText,
  Users,
  Bell,
  X,
  Clock,
  Trash2,
  Edit3,
  Send,
  ExternalLink,
  Download,
  FileUp,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  isSameDay,
} from "date-fns"
import {
  announcementsApi,
  ApiAnnouncement,
  ApiAnnouncementWrite,
  ApiCalendarDocument,
  ApiCalendarEvent,
  ApiCalendarEventCategory,
  calendarApi,
  extractUserReadableErrorMessages,
  importApi,
} from "../lib/api"
import { useApiQuery } from "../hooks/useApiQuery"
import { useGrades } from "../hooks/useGrades"
import { useSections } from "../hooks/useSections"
import { resolveMediaUrl } from "../lib/media/resolveMediaUrl"

type CalendarEventFormState = {
  title: string
  description: string
  category: ApiCalendarEventCategory
  targetRoles: ApiAnnouncementWrite["target_roles"]
  targetedGradeId: string
  targetedSectionIds: string[]
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  isAllDay: boolean
  isRange: boolean
}

type CalendarFormErrors = {
  title?: string
  description?: string
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
}

const categoryColors: Record<ApiCalendarEventCategory, string> = {
  Exam: "bg-red-500",
  Holiday: "bg-emerald-500",
  Meeting: "bg-blue-500",
  "School Event": "bg-amber-500",
}

const categoryBadge: Record<ApiCalendarEventCategory, string> = {
  Exam: "bg-red-50 text-red-600 border-red-100",
  Holiday: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Meeting: "bg-blue-50 text-blue-600 border-blue-100",
  "School Event": "bg-amber-50 text-amber-600 border-amber-100",
}

const emptyFormState = (): CalendarEventFormState => {
  const today = format(new Date(), "yyyy-MM-dd")

  return {
    title: "",
    description: "",
    category: "School Event",
    targetRoles: "BOTH",
    targetedGradeId: "",
    targetedSectionIds: [],
    startDate: today,
    endDate: today,
    startTime: "08:00",
    endTime: "09:00",
    isAllDay: true,
    isRange: false,
  }
}

function formStateFromEvent(event: ApiCalendarEvent): CalendarEventFormState {
  const isAllDay = !event.start_time && !event.end_time
  const isRange = event.start_date !== event.end_date

  return {
    title: event.title,
    description: event.description,
    category: event.category,
    targetRoles: event.target_roles,
    targetedGradeId: event.targeted_grades[0] ?? "",
    targetedSectionIds: event.targeted_sections ?? [],
    startDate: event.start_date,
    endDate: event.end_date,
    startTime: event.start_time ?? "08:00",
    endTime: event.end_time ?? "09:00",
    isAllDay,
    isRange,
  }
}

function isPdfCalendarFile(file: File) {
  const normalizedType = file.type.trim().toLowerCase()
  const normalizedName = file.name.trim().toLowerCase()

  return (
    normalizedType === "application/pdf" && normalizedName.endsWith(".pdf")
  )
}

export const AcademicCalendar: React.FC<{
  academicYear: string
  branchId: string | null
  organizationId: string | null
  academicYearId: string | null
}> = ({ academicYear, branchId, organizationId, academicYearId }) => {
  const [isUploadingPdf, setIsUploadingPdf] = useState(false)
  const [pdfActionError, setPdfActionError] = useState<string | null>(null)
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null)

  const {
    data: activeDocument,
    isLoading: documentLoading,
    error: documentError,
    refetch: refetchDocument,
  } = useApiQuery<ApiCalendarDocument | null>(
    branchId && organizationId
      ? () =>
          calendarApi.getActiveDocument(
            branchId,
            organizationId,
            academicYearId
          )
      : null,
    [branchId, organizationId, academicYearId]
  )

  useEffect(() => {
    let cancelled = false

    if (!activeDocument?.media_file) {
      setActivePdfUrl(null)
      return () => {
        cancelled = true
      }
    }

    resolveMediaUrl(activeDocument.media_file)
      .then((url) => {
        if (!cancelled) {
          setActivePdfUrl(url)
        }
      })
      .catch((error) => {
        console.error("Failed to resolve calendar PDF URL:", error)
        if (!cancelled) {
          setActivePdfUrl(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeDocument?.media_file])

  const isLoading = documentLoading
  const loadError = documentError

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
            Loading academic calendar PDF
          </p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
          <p className="font-black text-red-700">
            Failed to load academic calendar PDF
          </p>
          <p className="mt-2 text-sm text-red-600">{loadError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900">
              Academic Calendar
              <span className="rounded-full border border-primary/10 bg-primary/5 px-2 py-0.5 text-xs font-bold text-primary">
                {academicYear}
              </span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Upload and view the active academic calendar PDF for this
              academic year.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <CalendarPdfTab
          academicYear={academicYear}
          activeDocument={activeDocument}
          activePdfUrl={activePdfUrl}
          isUploading={isUploadingPdf}
          error={pdfActionError}
          onUpload={async (file) => {
            if (!branchId || !organizationId) {
              setPdfActionError(
                "Branch and organization context are required to upload the academic calendar PDF."
              )
              return
            }

            if (!isPdfCalendarFile(file)) {
              setPdfActionError(
                "Only PDF files are allowed. Select a file with MIME type application/pdf and a .pdf extension."
              )
              return
            }

            setIsUploadingPdf(true)
            setPdfActionError(null)

            try {
              await calendarApi.setActiveDocument({
                file,
                branchId,
                organizationId,
                academicYearId,
              })
              refetchDocument()
            } catch (error) {
              setPdfActionError(
                extractUserReadableErrorMessages(error).join(" ")
              )
            } finally {
              setIsUploadingPdf(false)
            }
          }}
        />
      </div>
    </div>
  )
}

function EventModal({
  isOpen,
  event,
  branchId,
  organizationId,
  academicYearId,
  grades,
  sections,
  onClose,
  onSaved,
}: {
  isOpen: boolean
  event: ApiCalendarEvent | null
  branchId: string | null
  organizationId: string | null
  academicYearId: string | null
  grades: Array<{ id: string; name: string; level: number }>
  sections: Array<{ id: string; grade: string; name: string }>
  onClose: () => void
  onSaved: (event: ApiCalendarEvent) => void
}) {
  const [form, setForm] = useState<CalendarEventFormState>(emptyFormState)
  const [errors, setErrors] = useState<CalendarFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setForm(event ? formStateFromEvent(event) : emptyFormState())
    setErrors({})
    setSubmitError(null)
    setIsSubmitting(false)
  }, [event, isOpen])

  const sectionsForSelectedGrade = useMemo(
    () =>
      form.targetedGradeId
        ? sections
            .filter((section) => section.grade === form.targetedGradeId)
            .sort((left, right) =>
              left.name.localeCompare(right.name, undefined, {
                sensitivity: "base",
                numeric: true,
              })
            )
        : [],
    [form.targetedGradeId, sections]
  )

  useEffect(() => {
    if (!form.targetedGradeId) {
      if (form.targetedSectionIds.length === 0) return
      setForm((current) => ({
        ...current,
        targetedSectionIds: [],
      }))
      return
    }

    const allowedSectionIds = new Set(
      sectionsForSelectedGrade.map((section) => section.id)
    )
    const filteredSectionIds = form.targetedSectionIds.filter((sectionId) =>
      allowedSectionIds.has(sectionId)
    )

    if (filteredSectionIds.length === form.targetedSectionIds.length) return

    setForm((current) => ({
      ...current,
      targetedSectionIds: filteredSectionIds,
    }))
  }, [form.targetedGradeId, form.targetedSectionIds, sectionsForSelectedGrade])

  if (!isOpen) {
    return null
  }

  function setField<K extends keyof CalendarEventFormState>(
    field: K,
    value: CalendarEventFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    if (
      field === "title" ||
      field === "description" ||
      field === "startDate" ||
      field === "endDate" ||
      field === "startTime" ||
      field === "endTime"
    ) {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }))
    }
  }

  function toggleSection(sectionId: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      targetedSectionIds: checked
        ? [...current.targetedSectionIds, sectionId]
        : current.targetedSectionIds.filter((id) => id !== sectionId),
    }))
  }

  function validateForm() {
    const nextErrors: CalendarFormErrors = {}

    if (!form.title.trim()) nextErrors.title = "Event title is required."
    if (!form.description.trim()) {
      nextErrors.description = "Description is required."
    }
    if (!form.startDate) nextErrors.startDate = "Start date is required."
    if (form.isRange && !form.endDate) nextErrors.endDate = "End date is required."
    if (!form.isAllDay && !form.startTime) {
      nextErrors.startTime = "Start time is required."
    }
    if (!form.isAllDay && !form.endTime) {
      nextErrors.endTime = "End time is required."
    }

    if (form.isRange && form.startDate && form.endDate) {
      if (new Date(form.endDate) < new Date(form.startDate)) {
        nextErrors.endDate = "End date cannot be before the start date."
      }
    }

    return nextErrors
  }

  async function handleSubmit() {
    if (!branchId || !organizationId) {
      setSubmitError("Branch and organization context are required.")
      return
    }

    const validationErrors = validateForm()
    setErrors(validationErrors)
    setSubmitError(null)

    if (Object.values(validationErrors).some(Boolean)) {
      return
    }

    setIsSubmitting(true)

    const announcementBasePayload: ApiAnnouncementWrite = {
      organization: organizationId,
      branch: branchId,
      subject: form.title.trim(),
      message: form.description.trim(),
      status: "DRAFT",
      is_urgent: false,
      target_roles: form.targetRoles,
      targeted_grades: form.targetedGradeId ? [form.targetedGradeId] : [],
      targeted_sections: form.targetedSectionIds,
      attachment: null,
      scheduled_at: null,
    }

    let createdAnnouncementId: string | null = null

    try {
      let linkedAnnouncementId = event?.linked_announcement_id ?? null

      if (linkedAnnouncementId) {
        const existingAnnouncement = await announcementsApi.get(
          linkedAnnouncementId
        )
        await announcementsApi.update(linkedAnnouncementId, {
          ...announcementBasePayload,
          status: existingAnnouncement.status,
        })
      } else {
        const createdAnnouncement = await announcementsApi.create(
          announcementBasePayload
        )
        linkedAnnouncementId = createdAnnouncement.id
        createdAnnouncementId = createdAnnouncement.id
      }

      const savedEvent = event
        ? await calendarApi.updateEvent(event.id, {
            title: form.title.trim(),
            description: form.description.trim(),
            start_date: form.startDate,
            end_date: form.isRange ? form.endDate : form.startDate,
            start_time: form.isAllDay ? null : form.startTime,
            end_time: form.isAllDay ? null : form.endTime,
            category: form.category,
            target_roles: form.targetRoles,
            targeted_grades: form.targetedGradeId ? [form.targetedGradeId] : [],
            targeted_sections: form.targetedSectionIds,
            linked_announcement_id: linkedAnnouncementId,
            academic_year: academicYearId,
          })
        : await calendarApi.createEvent({
            organization: organizationId,
            branch: branchId,
            academic_year: academicYearId,
            title: form.title.trim(),
            description: form.description.trim(),
            start_date: form.startDate,
            end_date: form.isRange ? form.endDate : form.startDate,
            start_time: form.isAllDay ? null : form.startTime,
            end_time: form.isAllDay ? null : form.endTime,
            category: form.category,
            target_roles: form.targetRoles,
            targeted_grades: form.targetedGradeId ? [form.targetedGradeId] : [],
            targeted_sections: form.targetedSectionIds,
            linked_announcement_id: linkedAnnouncementId,
          })

      onSaved(savedEvent)
    } catch (error) {
      if (createdAnnouncementId) {
        try {
          await announcementsApi.delete(createdAnnouncementId)
        } catch (cleanupError) {
          console.error("Failed to clean up announcement draft:", cleanupError)
        }
      }

      setSubmitError(extractUserReadableErrorMessages(error).join(" "))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
        >
          <div className="flex max-h-[90vh] flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/10 bg-primary/5">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight text-slate-900">
                    {event ? "Edit Event" : "Create New Event"}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    Every event creates or updates a linked draft announcement
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-all hover:bg-slate-50"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <Field label="Event Title" required error={errors.title}>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(event) => setField("title", event.target.value)}
                      placeholder="e.g., Parent-Teacher Conference"
                      className={fieldClassName(Boolean(errors.title))}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Category">
                      <select
                        value={form.category}
                        onChange={(event) =>
                          setField(
                            "category",
                            event.target.value as ApiCalendarEventCategory
                          )
                        }
                        className="field"
                      >
                        <option value="Exam">Exam</option>
                        <option value="Holiday">Holiday</option>
                        <option value="Meeting">Meeting</option>
                        <option value="School Event">School Event</option>
                      </select>
                    </Field>

                    <Field label="Audience">
                      <select
                        value={form.targetRoles}
                        onChange={(event) =>
                          setField(
                            "targetRoles",
                            event.target.value as ApiAnnouncementWrite["target_roles"]
                          )
                        }
                        className="field"
                      >
                        <option value="BOTH">Parents and Teachers</option>
                        <option value="PARENTS">Parents Only</option>
                        <option value="TEACHERS">Teachers Only</option>
                      </select>
                    </Field>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex rounded-lg bg-white p-1 shadow-sm">
                      <button
                        onClick={() => setField("isRange", false)}
                        className={`rounded-md px-3 py-1 text-[10px] font-black tracking-wider uppercase transition-all ${
                          !form.isRange
                            ? "bg-primary text-white shadow-sm"
                            : "text-slate-400"
                        }`}
                      >
                        Single Day
                      </button>
                      <button
                        onClick={() => setField("isRange", true)}
                        className={`rounded-md px-3 py-1 text-[10px] font-black tracking-wider uppercase transition-all ${
                          form.isRange
                            ? "bg-primary text-white shadow-sm"
                            : "text-slate-400"
                        }`}
                      >
                        Date Range
                      </button>
                    </div>

                    <label className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        All Day
                      </span>
                      <input
                        type="checkbox"
                        checked={form.isAllDay}
                        onChange={(event) =>
                          setField("isAllDay", event.target.checked)
                        }
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Start Date" required error={errors.startDate}>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(event) =>
                          setField("startDate", event.target.value)
                        }
                        className={fieldClassName(Boolean(errors.startDate))}
                      />
                    </Field>

                    <Field
                      label={form.isRange ? "End Date" : "End Date"}
                      required={form.isRange}
                      error={errors.endDate}
                    >
                      <input
                        type="date"
                        value={form.isRange ? form.endDate : form.startDate}
                        onChange={(event) =>
                          setField("endDate", event.target.value)
                        }
                        disabled={!form.isRange}
                        className={`${fieldClassName(Boolean(errors.endDate))} disabled:cursor-not-allowed disabled:opacity-60`}
                      />
                    </Field>
                  </div>

                  {!form.isAllDay && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field
                        label="Start Time"
                        required
                        error={errors.startTime}
                      >
                        <input
                          type="time"
                          value={form.startTime}
                          onChange={(event) =>
                            setField("startTime", event.target.value)
                          }
                          className={fieldClassName(Boolean(errors.startTime))}
                        />
                      </Field>
                      <Field label="End Time" required error={errors.endTime}>
                        <input
                          type="time"
                          value={form.endTime}
                          onChange={(event) =>
                            setField("endTime", event.target.value)
                          }
                          className={fieldClassName(Boolean(errors.endTime))}
                        />
                      </Field>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <Field label="Target Grade">
                    <select
                      value={form.targetedGradeId}
                      onChange={(event) =>
                        setField("targetedGradeId", event.target.value)
                      }
                      className="field"
                    >
                      <option value="">All grades</option>
                      {grades.map((grade) => (
                        <option key={grade.id} value={grade.id}>
                          {grade.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Target Sections">
                    <div className="min-h-[140px] rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      {!form.targetedGradeId ? (
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
                                checked={form.targetedSectionIds.includes(
                                  section.id
                                )}
                                onChange={(event) =>
                                  toggleSection(section.id, event.target.checked)
                                }
                              />
                              <span className="text-sm font-bold text-slate-700">
                                Section {section.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </Field>

                  <Field
                    label="Description"
                    required
                    error={errors.description}
                  >
                    <textarea
                      rows={8}
                      value={form.description}
                      onChange={(event) =>
                        setField("description", event.target.value)
                      }
                      placeholder="Describe the event and the linked announcement message..."
                      className={`${fieldClassName(
                        Boolean(errors.description)
                      )} min-h-[220px] resize-none`}
                    />
                  </Field>
                </div>
              </div>

              {submitError && (
                <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-6">
              <button
                onClick={onClose}
                className="px-6 py-3 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-600"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => void handleSubmit()}
                className="rounded-xl bg-primary px-8 py-3 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? event
                    ? "Saving..."
                    : "Creating..."
                  : event
                    ? "Save Event"
                    : "Create Event"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function ImportCalendarModal({
  isOpen,
  file,
  isImporting,
  progress,
  taskId,
  errors,
  onClose,
  onFileChange,
  onImport,
}: {
  isOpen: boolean
  file: File | null
  isImporting: boolean
  progress: number
  taskId: string | null
  errors: string[]
  onClose: () => void
  onFileChange: (file: File | null) => void
  onImport: () => Promise<void>
}) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg space-y-6 rounded-[2rem] bg-white p-10 text-center shadow-2xl"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-primary/10 bg-primary/5 shadow-sm">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-slate-900">
              Calendar Event Import
            </h3>
            <p className="text-sm font-medium text-slate-500">
              Upload a CSV file to import calendar events and draft announcements
            </p>
          </div>
          <label className="block">
            <div className="group cursor-pointer rounded-[2rem] border-2 border-dashed border-slate-200 p-12 transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
              <div className="space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm transition-transform group-hover:scale-110">
                  <FileUp className="h-6 w-6 text-slate-300 transition-colors group-hover:text-primary" />
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight text-slate-900">
                    {file ? file.name : "Click or drag file to upload"}
                  </p>
                  <p className="mt-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
                    .csv supported
                  </p>
                </div>
              </div>
            </div>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
            />
          </label>
          <p className="text-xs text-slate-500">
            The backend will validate the uploaded calendar file before creating
            events and linked draft announcements.
          </p>

          {(isImporting || taskId) && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
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

          {errors.length > 0 && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-left text-sm text-red-700">
              <div className="space-y-1">
                {errors.map((message) => (
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
              disabled={!file || isImporting}
              onClick={() => void onImport()}
              className="text-[10px] font-black tracking-widest text-primary uppercase hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
            >
              {isImporting ? "Importing..." : "Upload File"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function LinkedAnnouncementModal({
  announcement,
  isOpen,
  onClose,
  onSend,
}: {
  announcement: ApiAnnouncement | null
  isOpen: boolean
  onClose: () => void
  onSend: () => Promise<void>
}) {
  const [isSending, setIsSending] = useState(false)

  if (!isOpen || !announcement) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[230] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900">
                Linked Announcement
              </h3>
              <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                {announcement.status}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-all hover:bg-slate-50"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6 p-6">
            <InfoBlock label="Subject" value={announcement.subject} />
            <InfoBlock label="Message" value={announcement.message} />
            <InfoBlock label="Audience" value={audienceLabel(announcement.target_roles)} />
            <InfoBlock
              label="Status"
              value={announcement.status === "SENT" ? "Sent" : "Draft"}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-6">
            <button
              onClick={onClose}
              className="px-6 py-3 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-600"
            >
              Close
            </button>
            {announcement.status !== "SENT" && (
              <button
                disabled={isSending}
                onClick={async () => {
                  setIsSending(true)
                  try {
                    await onSend()
                    onClose()
                  } finally {
                    setIsSending(false)
                  }
                }}
                className="rounded-xl bg-primary px-8 py-3 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? "Sending..." : "Send Draft"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function CalendarPdfTab({
  academicYear,
  activeDocument,
  activePdfUrl,
  isUploading,
  error,
  onUpload,
}: {
  academicYear: string
  activeDocument: ApiCalendarDocument | null
  activePdfUrl: string | null
  isUploading: boolean
  error: string | null
  onUpload: (file: File) => Promise<void>
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Calendar PDF
          </h2>
          <p className="text-sm text-slate-500">
            View or replace the current academic calendar document for{" "}
            {academicYear}.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95">
          <UploadIcon />
          <span>{isUploading ? "Uploading..." : "Upload PDF"}</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                void onUpload(file)
              }
            }}
            disabled={isUploading}
          />
        </label>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!activeDocument?.media_file ? (
        <EmptyState message="No academic calendar PDF has been uploaded yet." />
      ) : (
        <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Active Document
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {activeDocument.file_name || "Academic calendar PDF"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Last updated{" "}
                {activeDocument.updated_at
                  ? format(new Date(activeDocument.updated_at), "MMM d, yyyy HH:mm")
                  : "recently"}
              </p>
            </div>

            {activePdfUrl && (
              <div className="flex items-center gap-2">
                <a
                  href={activePdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
                <a
                  href={activePdfUrl}
                  download
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </div>
            )}
          </div>

          {activePdfUrl ? (
            <iframe
              title="Academic calendar PDF"
              src={activePdfUrl}
              className="h-[75vh] w-full rounded-2xl border border-slate-100"
            />
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-500">
              The PDF is stored, but its preview URL could not be resolved. Use
              the open/download actions when available.
            </div>
          )}
        </div>
      )}
    </div>
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
      <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
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

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white">
        {icon}
      </div>
      <div>
        <p className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
          {label}
        </p>
        <p className="mt-2 text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
      {message}
    </div>
  )
}

function fieldClassName(hasError: boolean) {
  return `field ${
    hasError
      ? "border-red-300 bg-red-50/60 focus:border-red-300 focus:ring-red-100"
      : ""
  }`
}

function eventOccursOnDay(event: ApiCalendarEvent, day: Date) {
  const start = new Date(event.start_date)
  const end = new Date(event.end_date)

  if (isSameDay(start, end)) {
    return isSameDay(start, day)
  }

  return isWithinInterval(day, { start, end })
}

function audienceLabel(audience: ApiAnnouncement["target_roles"]) {
  if (audience === "PARENTS") return "Parents Only"
  if (audience === "TEACHERS") return "Teachers Only"
  return "Parents and Teachers"
}

function targetScopeLabel(
  event: Pick<ApiCalendarEvent, "target_roles" | "targeted_grades" | "targeted_sections">,
  grades: Array<{ id: string; name: string }>,
  sections: Array<{ id: string; grade: string; name: string }>
) {
  const gradeLabels = event.targeted_grades
    .map((gradeId) => grades.find((grade) => grade.id === gradeId)?.name)
    .filter((value): value is string => Boolean(value))

  const sectionLabels = event.targeted_sections
    .map((sectionId) => sections.find((section) => section.id === sectionId))
    .filter(Boolean)
    .map((section) => `Section ${section!.name}`)

  if (gradeLabels.length === 0 && sectionLabels.length === 0) {
    if (event.target_roles === "PARENTS") return "All Parents"
    if (event.target_roles === "TEACHERS") return "All Teachers"
    return "Whole School"
  }

  return [...gradeLabels, ...sectionLabels].join(", ")
}

function targetGradeLabel(
  event: Pick<ApiCalendarEvent, "targeted_grades">,
  grades: Array<{ id: string; name: string }>
) {
  const labels = event.targeted_grades
    .map((gradeId) => grades.find((grade) => grade.id === gradeId)?.name)
    .filter((value): value is string => Boolean(value))

  return labels.length > 0 ? labels.join(", ") : "All grades"
}

function targetSectionsLabel(
  event: Pick<ApiCalendarEvent, "targeted_sections">,
  sections: Array<{ id: string; name: string }>
) {
  const labels = event.targeted_sections
    .map((sectionId) => sections.find((section) => section.id === sectionId))
    .filter(Boolean)
    .map((section) => `Section ${section!.name}`)

  return labels.length > 0 ? labels.join(", ") : "All sections in audience scope"
}

function eventDateLabel(event: ApiCalendarEvent) {
  if (event.start_date === event.end_date) {
    return format(new Date(event.start_date), "PPPP")
  }

  return `${format(new Date(event.start_date), "PP")} - ${format(
    new Date(event.end_date),
    "PP"
  )}`
}

function eventTimeLabel(event: ApiCalendarEvent) {
  if (!event.start_time && !event.end_time) {
    return "All Day"
  }

  if (event.start_time && event.end_time) {
    return `${event.start_time} - ${event.end_time}`
  }

  return event.start_time ?? event.end_time ?? "All Day"
}

function linkedAnnouncementIndicator(event: ApiCalendarEvent) {
  return event.linked_announcement_id ? "Draft Linked" : "Pending Link"
}

function UploadIcon() {
  return <FileUp className="h-4 w-4" />
}
