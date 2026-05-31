import Image from "next/image"
import React, { useEffect, useMemo, useState } from "react"
import {
  Users,
  Search,
  UserPlus,
  Link2,
  Link2Off,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Edit3,
  Mail,
  Phone,
  ArrowUpDown,
  X,
  Loader2,
  Trash2,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { MediaUploader, MediaUploaderState } from "./MediaUploader"
import { deleteQueuedMedia } from "../lib/media/deleteQueuedMedia"
import { resolveMediaUrl } from "../lib/media/resolveMediaUrl"
import { Student, Parent } from "../types"
import {
  ApiParentLink,
  ApiStudent,
  ApiParent,
  extractApiError,
  extractUserReadableErrorMessages,
  importApi,
  parentsApi,
  studentsApi,
  StudentGender,
  StudentStatus,
} from "../lib/api"
import { useApiQuery } from "../hooks/useApiQuery"
import { useBackfilledFilteredPagination } from "../hooks/useBackfilledFilteredPagination"
import { useGrades } from "../hooks/useGrades"
import { useSections } from "../hooks/useSections"

// ---------------------------------------------------------------------------
// Mappers: API shape → UI shape
// ---------------------------------------------------------------------------
function mapStudent(s: ApiStudent, links: ApiParentLink[]): Student {
  const studentLinks = links.filter((link) => link.student === s.id)
  const primaryLink =
    studentLinks.find((link) => link.is_primary_contact) ?? studentLinks[0]

  return {
    id: s.id,
    name: `${s.first_name} ${s.last_name}`.trim(),
    firstName: s.first_name,
    lastName: s.last_name,
    grade: s.grade_name ?? "",
    gradeId: s.grade_id ?? "",
    section: s.section_name ?? "",
    sectionId: s.current_section ?? "",
    rollNo: s.roll_no,
    gender: s.gender,
    dateOfBirth: s.date_of_birth,
    admissionDate: s.admission_date,
    photoUrl: s.photo,
    registrationStatus:
      s.status === "ACTIVE"
        ? "Registered"
        : s.status === "WITHDRAWN"
          ? "Withdrawn"
          : s.status === "GRADUATED"
            ? "Graduated"
            : "Pending",
    languagePreference: "English",
    parentId: primaryLink?.parent,
    branchId: s.branch,
    organizationId: s.organization,
    academicYearId: s.academic_year_id,
  }
}

function mapParent(p: ApiParent, links: ApiParentLink[]): Parent {
  const parentLinks = links.filter((link) => link.parent === p.id)
  const primaryLink =
    parentLinks.find((link) => link.is_primary_contact) ?? parentLinks[0]
  const linkedStudentCount = parentLinks.length
  const status =
    linkedStudentCount === 0 ? "Unlinked" : p.is_active ? "Active" : "Pending"

  return {
    id: p.id,
    name: p.user_details?.name ?? "",
    fatherName: p.user_details?.father_name ?? "",
    phone: p.user_details?.phone_number ?? "",
    email: p.user_details?.email ?? "",
    status,
    linkedStudents: parentLinks.map((link) => link.student),
    languagePreference: "English",
    relationship:
      primaryLink?.relationship_type === "Mother"
        ? "Mother"
        : primaryLink?.relationship_type === "Guardian"
          ? "Guardian"
          : "Father",
    isPrimaryContact: primaryLink?.is_primary_contact ?? false,
    isActive: p.is_active,
    occupation: p.occupation,
    emergencyContactName: p.emergency_contact_name,
    emergencyContactPhone: p.emergency_contact_phone,
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface StudentsProps {
  academicYear: string
  branchId: string | null
  organizationId: string | null
  academicYearId: string | null
}

const emptyMediaUploaderState: MediaUploaderState = {
  hasChanges: false,
  mediaId: null,
  pendingRemovalIds: [],
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
  academicYearId?: string | null
}): Promise<ApiStudent[]> {
  const { branchId, organizationId, academicYearId } = params
  const students: ApiStudent[] = []
  let page = 1

  while (true) {
    const response = await studentsApi.list({
      branch: branchId ?? undefined,
      organization: organizationId ?? undefined,
      academic_year: academicYearId ?? undefined,
      page,
    })
    students.push(...response.results)

    if (!response.next) break
    page += 1
  }

  return students
}

async function fetchAllParents(params: {
  branchId?: string | null
  organizationId?: string | null
}): Promise<ApiParent[]> {
  const { branchId, organizationId } = params
  const parents: ApiParent[] = []
  let page = 1

  while (true) {
    const response = await parentsApi.list({
      branch: branchId ?? undefined,
      organization: organizationId ?? undefined,
      page,
    })
    parents.push(...response.results)

    if (!response.next) break
    page += 1
  }

  return parents
}

export const Students: React.FC<StudentsProps> = ({
  academicYear,
  branchId,
  organizationId,
  academicYearId,
}) => {
  const normalizeRollNo = (value: string) => value.trim().toLowerCase()

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasResolvedInitialLoad, setHasResolvedInitialLoad] = useState(false)
  const [activeTab, setActiveTab] = useState<
    "all" | "linked" | "unlinked" | "unassigned"
  >("all")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [studentToAssign, setStudentToAssign] = useState<Student | null>(null)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [assignForm, setAssignForm] = useState({
    gradeId: "",
    sectionId: "",
    rollNo: "",
  })
  const [isAssigningStudent, setIsAssigningStudent] = useState(false)
  const [assignStudentError, setAssignStudentError] = useState<string | null>(
    null
  )
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importGradeId, setImportGradeId] = useState("")
  const [importSectionId, setImportSectionId] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [importErrorMessages, setImportErrorMessages] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const [importTaskId, setImportTaskId] = useState<string | null>(null)
  const [studentToLink, setStudentToLink] = useState<Student | null>(null)
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false)
  const [smsStudent, setSmsStudent] = useState<Student | null>(null)
  const [smsPhone, setSmsPhone] = useState("")
  const [smsMessage, setSmsMessage] = useState("")
  const [parentSearchQuery, setParentSearchQuery] = useState("")
  const [linkingParentId, setLinkingParentId] = useState<string | null>(null)
  const [linkParentError, setLinkParentError] = useState<string | null>(null)
  const [gradeFilter, setGradeFilter] = useState<string>("All")
  const [sectionFilter, setSectionFilter] = useState<string>("All")
  const [studentSort, setStudentSort] = useState<"name_asc" | "name_desc">(
    "name_asc"
  )
  const [newStudentForm, setNewStudentForm] = useState({
    firstName: "",
    lastName: "",
    rollNo: "",
    gradeId: "",
    sectionId: "",
    gender: "MALE" as StudentGender,
    dateOfBirth: "",
    admissionDate: new Date().toISOString().split("T")[0],
    status: "ACTIVE" as StudentStatus,
  })
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false)
  const [studentFormError, setStudentFormError] = useState<string | null>(null)
  const [studentPhotoState, setStudentPhotoState] =
    useState<MediaUploaderState>(emptyMediaUploaderState)
  const [isStudentMediaBusy, setIsStudentMediaBusy] = useState(false)
  const [isDeletingStudent, setIsDeletingStudent] = useState(false)
  const [deleteStudentError, setDeleteStudentError] = useState<string | null>(
    null
  )

  // API hooks
  const {
    data: links,
    isLoading: linksLoading,
    error: linksError,
    refetch: refetchLinks,
  } = useApiQuery<ApiParentLink[]>(
    branchId || organizationId ? () => fetchAllParentLinks() : null,
    [branchId, organizationId]
  )
  const {
    data: allRawParents,
    refetch: refetchAllParents,
  } = useApiQuery<ApiParent[]>(
    branchId || organizationId
      ? () => fetchAllParents({ branchId, organizationId })
      : null,
    [branchId, organizationId]
  )
  const { grades } = useGrades(branchId)
  const { sections } = useSections(branchId, academicYearId)
  const normalizedSearchQuery = searchQuery.trim()
  const selectedGrade = useMemo(
    () => grades.find((grade) => grade.name === gradeFilter) ?? null,
    [gradeFilter, grades]
  )
  const {
    data: allRawStudents,
    isLoading: allStudentsLoading,
    error: allStudentsError,
    refetch: refetchAllStudents,
  } = useApiQuery<ApiStudent[]>(
    branchId || organizationId
      ? () => fetchAllStudents({ branchId, organizationId, academicYearId })
      : null,
    [branchId, organizationId, academicYearId]
  )
  const parents = useMemo(
    () => (allRawParents ?? []).map((parent) => mapParent(parent, links ?? [])),
    [allRawParents, links]
  )
  const allStudents = useMemo(
    () => (allRawStudents ?? []).map((student) => mapStudent(student, links ?? [])),
    [allRawStudents, links]
  )
  const directoryFetchPage = useMemo(() => {
    if (!branchId && !organizationId) return null

    return (page: number) =>
      studentsApi.list({
        branch: branchId ?? undefined,
        organization: organizationId ?? undefined,
        academic_year: academicYearId ?? undefined,
        page,
      })
  }, [academicYearId, branchId, organizationId])
  const normalizedDirectorySearchQuery = normalizedSearchQuery.toLowerCase()
  const studentDirectoryFilterFn = useMemo(
    () => (student: ApiStudent) => {
      const mappedStudent = mapStudent(student, links ?? [])
      const matchesSearch =
        normalizedDirectorySearchQuery.length === 0 ||
        mappedStudent.name
          .toLowerCase()
          .includes(normalizedDirectorySearchQuery) ||
        mappedStudent.rollNo
          .toLowerCase()
          .includes(normalizedDirectorySearchQuery)
      const matchesGrade =
        gradeFilter === "All" || mappedStudent.grade === gradeFilter
      const matchesSection =
        sectionFilter === "All" || mappedStudent.section === sectionFilter
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "linked" && Boolean(mappedStudent.parentId)) ||
        (activeTab === "unlinked" && !mappedStudent.parentId) ||
        (activeTab === "unassigned" && !mappedStudent.sectionId)

      return matchesSearch && matchesGrade && matchesSection && matchesTab
    },
    [
      activeTab,
      gradeFilter,
      links,
      normalizedDirectorySearchQuery,
      sectionFilter,
    ]
  )
  const studentDirectorySortFn = useMemo(
    () => (left: ApiStudent, right: ApiStudent) => {
      const leftName = `${left.first_name} ${left.last_name}`.trim()
      const rightName = `${right.first_name} ${right.last_name}`.trim()
      const comparison = leftName.localeCompare(rightName, undefined, {
        sensitivity: "base",
      })

      return studentSort === "name_asc" ? comparison : -comparison
    },
    [studentSort]
  )
  const {
    items: directoryStudents,
    totalFilteredCount,
    hasNextPage,
    hasPreviousPage,
    isLoading: directoryLoading,
    error: directoryError,
    isPageOutOfRange,
    refetch: refetchDirectoryStudents,
  } = useBackfilledFilteredPagination<ApiStudent>({
    fetchPage: directoryFetchPage,
    currentPage,
    deps: [
      academicYearId,
      activeTab,
      branchId,
      gradeFilter,
      links,
      normalizedDirectorySearchQuery,
      organizationId,
      sectionFilter,
      studentSort,
    ],
    filterFn: studentDirectoryFilterFn,
    sortFn: studentDirectorySortFn,
  })
  const displayedStudents = useMemo(
    () => directoryStudents.map((student) => mapStudent(student, links ?? [])),
    [directoryStudents, links]
  )
  const selectedStudentParent = useMemo(
    () =>
      selectedStudent?.parentId
        ? parents.find((parent) => parent.id === selectedStudent.parentId) ?? null
        : null,
    [parents, selectedStudent]
  )
  const summaryStudents = useMemo(() => {
    return allStudents.filter((student) => {
      const matchesSearch =
        normalizedDirectorySearchQuery.length === 0 ||
        student.name.toLowerCase().includes(normalizedDirectorySearchQuery) ||
        student.rollNo.toLowerCase().includes(normalizedDirectorySearchQuery)
      const matchesGrade =
        gradeFilter === "All" || student.grade === gradeFilter
      const matchesSection =
        sectionFilter === "All" || student.section === sectionFilter

      return matchesSearch && matchesGrade && matchesSection
    })
  }, [allStudents, gradeFilter, normalizedDirectorySearchQuery, sectionFilter])
  const filteredStudentCount = totalFilteredCount ?? displayedStudents.length

  useEffect(() => {
    setCurrentPage(1)
  }, [academicYearId, branchId, organizationId])
  useEffect(() => {
    setCurrentPage(1)
  }, [normalizedSearchQuery, gradeFilter, sectionFilter, activeTab, studentSort])

  useEffect(() => {
    if (gradeFilter === "All" || sectionFilter === "All") return

    const sectionStillMatchesGrade = sections.some(
      (section) =>
        section.name === sectionFilter &&
        section.grade === selectedGrade?.id
    )

    if (!sectionStillMatchesGrade) {
      setSectionFilter("All")
    }
  }, [gradeFilter, sectionFilter, sections, selectedGrade])

  useEffect(() => {
    setSelectedStudent(null)
    setStudentToAssign(null)
    setStudentToLink(null)
    setStudentToDelete(null)
    setDeleteStudentError(null)
  }, [currentPage])
  useEffect(() => {
    if (isPageOutOfRange) {
      setCurrentPage((page) => Math.max(1, page - 1))
    }
  }, [isPageOutOfRange])
  const searchableParents = useMemo(() => {
    const query = parentSearchQuery.trim().toLowerCase()
    return parents.filter((parent) => {
      if (!query) return true

      return (
        parent.name.toLowerCase().includes(query) ||
        parent.phone.toLowerCase().includes(query)
      )
    })
  }, [parentSearchQuery, parents])

  // Unique section names for filter dropdown
  const sectionNames = useMemo(
    () =>
      Array.from(new Set(sections.map((s) => s.name))).sort((left, right) =>
        left.localeCompare(right, undefined, { sensitivity: "base" })
      ),
    [sections]
  )
  const sectionsForSelectedGrade = useMemo(
    () =>
      newStudentForm.gradeId
        ? sections.filter((section) => section.grade === newStudentForm.gradeId)
        : sections,
    [newStudentForm.gradeId, sections]
  )
  const importSectionsForSelectedGrade = useMemo(
    () =>
      importGradeId
        ? sections.filter((section) => section.grade === importGradeId)
        : [],
    [importGradeId, sections]
  )
  const assignSectionsForSelectedGrade = useMemo(
    () =>
      assignForm.gradeId
        ? sections.filter((section) => section.grade === assignForm.gradeId)
        : [],
    [assignForm.gradeId, sections]
  )

  const stats = useMemo(
    () => ({
      total: summaryStudents.length,
      linked: summaryStudents.filter((student) => student.parentId).length,
      unlinked: summaryStudents.filter((student) => !student.parentId).length,
      unassigned: summaryStudents.filter((student) => !student.sectionId).length,
      withdrawn: summaryStudents.filter(
        (student) => student.registrationStatus === "Withdrawn"
      ).length,
    }),
    [summaryStudents]
  )

  const isLoading = directoryLoading || allStudentsLoading || linksLoading
  const isInitialLoading = !hasResolvedInitialLoad && isLoading
  const isBackgroundRefreshing = hasResolvedInitialLoad && isLoading

  useEffect(() => {
    if (!isLoading) {
      setHasResolvedInitialLoad(true)
    }
  }, [isLoading])

  const resetStudentForm = () => {
    setNewStudentForm({
      firstName: "",
      lastName: "",
      rollNo: "",
      gradeId: "",
      sectionId: "",
      gender: "MALE",
      dateOfBirth: "",
      admissionDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
    })
    setStudentFormError(null)
    setStudentPhotoState(emptyMediaUploaderState)
  }

  const cleanupStudentMedia = async () => {
    const mediaIdsToDelete = new Set(studentPhotoState.pendingRemovalIds)

    if (studentPhotoState.mediaId) {
      mediaIdsToDelete.add(studentPhotoState.mediaId)
    }

    if (mediaIdsToDelete.size > 0) {
      await deleteQueuedMedia([...mediaIdsToDelete])
    }

    setStudentPhotoState(emptyMediaUploaderState)
  }

  const closeAddStudentModal = async () => {
    if (isStudentMediaBusy || isSubmittingStudent) {
      return
    }

    try {
      await cleanupStudentMedia()
    } finally {
      resetStudentForm()
      setIsAddModalOpen(false)
    }
  }

  const closeLinkParentModal = () => {
    setStudentToLink(null)
    setParentSearchQuery("")
    setLinkParentError(null)
    setLinkingParentId(null)
  }

  const openAssignStudentModal = (student: Student) => {
    setStudentToAssign(student)
    setAssignForm({
      gradeId: student.gradeId || "",
      sectionId: "",
      rollNo: student.rollNo || "",
    })
    setAssignStudentError(null)
  }

  const closeAssignStudentModal = () => {
    if (isAssigningStudent) return
    setStudentToAssign(null)
    setAssignForm({
      gradeId: "",
      sectionId: "",
      rollNo: "",
    })
    setAssignStudentError(null)
  }

  const closeDeleteStudentModal = () => {
    if (isDeletingStudent) return
    setStudentToDelete(null)
    setDeleteStudentError(null)
  }

  const closeImportModal = () => {
    if (isImporting) return
    setIsImportModalOpen(false)
    setImportFile(null)
    setImportGradeId("")
    setImportSectionId("")
    setImportErrorMessages([])
    setImportProgress(0)
    setImportTaskId(null)
  }

  async function handleLinkParent(student: Student, parent: Parent) {
    setLinkingParentId(parent.id)
    setLinkParentError(null)

    try {
      await parentsApi.createLink({
        student: student.id,
        parent: parent.id,
        relationship_type: "FATHER",
        is_primary_contact: true,
      })
      refetchDirectoryStudents()
      refetchAllStudents()
      refetchAllParents()
      refetchLinks()
      closeLinkParentModal()
      if (selectedStudent?.id === student.id) {
        setSelectedStudent({
          ...selectedStudent,
          parentId: parent.id,
        })
      }
    } catch (error) {
      setLinkParentError(extractApiError(error))
    } finally {
      setLinkingParentId(null)
    }
  }

  async function handleStudentImport() {
    if (!importFile || !branchId || !organizationId) return

    if (importGradeId && !importSectionId) {
      setImportErrorMessages([
        "Select a section after choosing a grade, or leave both blank.",
      ])
      return
    }

    setIsImporting(true)
    setImportErrorMessages([])
    setImportProgress(25)
    setImportTaskId(null)

    try {
      const started = await importApi.uploadBulkFile(
        "students",
        importFile,
        organizationId,
        branchId,
        importSectionId
          ? {
              current_section: importSectionId,
            }
          : undefined
      )

      if (!started.task_id) {
        throw new Error("Bulk import started without a task id.")
      }

      setImportTaskId(started.task_id)
      setImportProgress(50)
      let attempts = 0

      while (attempts < 60) {
        const job = await importApi.getStatus(started.task_id)
        setImportProgress(Math.max(55, Math.min(job.progress || 0, 100)))

        if (job.status === "success") {
          setImportProgress(100)
          refetchDirectoryStudents()
          refetchAllStudents()
          closeImportModal()
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

      throw new Error("Bulk import is still processing. Check again shortly.")
    } catch (error) {
      setImportErrorMessages(extractUserReadableErrorMessages(error))
      setImportTaskId(null)
      setImportProgress(0)
    } finally {
      setIsImporting(false)
    }
  }

  async function handleAssignStudent() {
    const trimmedRollNo = assignForm.rollNo.trim()

    if (
      !studentToAssign ||
      !academicYearId ||
      !assignForm.sectionId ||
      !trimmedRollNo
    ) {
      setAssignStudentError(
        "Academic year, section, and roll number are required."
      )
      return
    }

    setIsAssigningStudent(true)
    setAssignStudentError(null)

    try {
      const sectionStudents = await studentsApi.bySection(assignForm.sectionId)
      const duplicateRollNo = sectionStudents.some(
        (student) =>
          student.id !== studentToAssign.id &&
          normalizeRollNo(student.roll_no) === normalizeRollNo(trimmedRollNo)
      )

      if (duplicateRollNo) {
        setAssignStudentError(
          "That roll number is already in use in the selected section."
        )
        return
      }

      await studentsApi.update(studentToAssign.id, {
        academic_year: academicYearId,
        current_section: assignForm.sectionId,
        roll_no: trimmedRollNo,
      })
      refetchDirectoryStudents()
      refetchAllStudents()
      if (selectedStudent?.id === studentToAssign.id) {
        const assignedSection = sections.find(
          (section) => section.id === assignForm.sectionId
        )
        const assignedGrade = grades.find(
          (grade) => grade.id === assignedSection?.grade
        )
        setSelectedStudent({
          ...selectedStudent,
          grade: assignedGrade?.name ?? selectedStudent.grade,
          gradeId: assignedGrade?.id ?? selectedStudent.gradeId,
          section: assignedSection?.name ?? selectedStudent.section,
          sectionId: assignForm.sectionId,
          rollNo: trimmedRollNo,
          academicYearId,
        })
      }
      closeAssignStudentModal()
    } catch (error) {
      setAssignStudentError(
        error instanceof Error ? error.message : "Failed to assign student."
      )
    } finally {
      setIsAssigningStudent(false)
    }
  }

  async function handleDeleteStudent() {
    if (!studentToDelete) return

    setIsDeletingStudent(true)
    setDeleteStudentError(null)

    try {
      await studentsApi.delete(studentToDelete.id)

      const shouldGoToPreviousPage =
        currentPage > 1 && displayedStudents.length === 1

      setSelectedStudent(null)
      setStudentToDelete(null)

      if (shouldGoToPreviousPage) {
        setCurrentPage((page) => Math.max(1, page - 1))
      } else {
        refetchDirectoryStudents()
        refetchAllStudents()
      }
    } catch (error) {
      setDeleteStudentError(extractApiError(error))
    } finally {
      setIsDeletingStudent(false)
    }
  }

  // Loading / error states
  if (isInitialLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">
            Loading students...
          </p>
        </div>
      </div>
    )
  }

  if (directoryError || allStudentsError) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/30 p-8">
        <div className="max-w-md space-y-2 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="text-sm font-bold text-red-600">
            Failed to load students
          </p>
          <p className="text-xs text-red-400">
            {directoryError || allStudentsError}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-slate-50/30">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-slate-100 bg-white px-4 py-4 md:px-8 md:py-6">
        <div className="flex flex-col justify-between gap-4 md:gap-6 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900 md:gap-3 md:text-2xl">
              Students
              <span className="rounded-full border border-primary/10 bg-primary/5 px-2 py-0.5 text-[10px] font-bold tracking-wider whitespace-nowrap text-primary uppercase">
                {academicYear}
              </span>
            </h1>
            <p className="hidden text-sm font-medium text-slate-500 italic md:block">
              Monitor registrations and manage parent linkages
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95 md:px-4 md:py-2.5 md:text-sm lg:flex-none"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">Import</span>
            </button>
            <button
              onClick={() => {
                resetStudentForm()
                setIsAddModalOpen(true)
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95 md:px-4 md:py-2.5 md:text-sm lg:flex-none"
            >
              <UserPlus className="h-4 w-4 shrink-0" />
              <span className="truncate">New Student</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-2 md:mt-8 md:gap-4 lg:grid-cols-4">
          {[
            {
              label: "Total Students",
              value: stats.total,
              icon: Users,
              color: "text-primary",
            },
            {
              label: "Linked to Parents",
              value: stats.linked,
              icon: ShieldCheck,
              color: "text-emerald-500",
            },
            {
              label: "Unlinked Students",
              value: stats.unlinked,
              icon: Link2Off,
              color: "text-amber-500",
            },
            {
              label: "Withdrawn",
              value: stats.withdrawn,
              icon: AlertCircle,
              color: "text-slate-400",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-primary/20 hover:bg-white"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="mb-1 text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                  {stat.label}
                </p>
                <p className="text-xl leading-none font-black text-slate-900">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
            <div className="no-scrollbar flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-[10px] font-bold whitespace-nowrap transition-all md:text-xs lg:flex-none ${
                  activeTab === "all"
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "text-slate-500 hover:text-primary"
                }`}
              >
                All Students
              </button>
              <button
                onClick={() => setActiveTab("linked")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-[10px] font-bold whitespace-nowrap transition-all md:text-xs lg:flex-none ${
                  activeTab === "linked"
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                    : "text-slate-500 hover:text-emerald-500"
                }`}
              >
                Linked
                {stats.linked > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === "linked" ? "bg-white text-emerald-500" : "bg-emerald-100 text-emerald-600"}`}
                  >
                    {stats.linked}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("unlinked")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-[10px] font-bold whitespace-nowrap transition-all md:text-xs lg:flex-none ${
                  activeTab === "unlinked"
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/10"
                    : "text-slate-500 hover:text-amber-500"
                }`}
              >
                Unlinked
                {stats.unlinked > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === "unlinked" ? "bg-white text-amber-500" : "bg-amber-100 text-amber-600"}`}
                  >
                    {stats.unlinked}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("unassigned")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-[10px] font-bold whitespace-nowrap transition-all md:text-xs lg:flex-none ${
                  activeTab === "unassigned"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/10"
                    : "text-slate-500 hover:text-rose-500"
                }`}
              >
                Unassigned
                {stats.unassigned > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      activeTab === "unassigned"
                        ? "bg-white text-rose-500"
                        : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    {stats.unassigned}
                  </span>
                )}
              </button>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 md:gap-3 lg:w-auto">
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/10 md:px-3 md:text-xs lg:flex-none"
              >
                <option value="All">All Grades</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/10 md:px-3 md:text-xs lg:flex-none"
              >
                <option value="All">All Sections</option>
                {sectionNames.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="relative w-full lg:w-48 xl:w-64">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-10 text-[10px] font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/10 md:text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setStudentSort((current) =>
                    current === "name_asc" ? "name_desc" : "name_asc"
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 md:text-xs"
                title="Toggle name sort order"
              >
                <ArrowUpDown className="h-4 w-4" />
                {studentSort === "name_asc" ? "A-Z" : "Z-A"}
              </button>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {isBackgroundRefreshing && (
              <div className="flex items-center justify-end gap-2 border-b border-slate-100 bg-slate-50 px-6 py-3 text-xs font-bold text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Refreshing page...
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Grade/Section
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Parent Link
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedStudents.length > 0 ? (
                    displayedStudents.map((student) => (
                      <tr
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className="group cursor-pointer transition-colors hover:bg-slate-50/80"
                      >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <StudentAvatar
                                student={student}
                                className="h-10 w-10 rounded-xl"
                                iconClassName="w-5 h-5"
                              />
                              <div>
                                <p className="text-sm font-black text-slate-900 transition-colors group-hover:text-primary">
                                  {student.name}
                                </p>
                                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                  {student.rollNo || student.id.slice(0, 8)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {student.sectionId ? (
                              <span className="text-xs font-bold text-slate-700">
                                {student.grade} - {student.section}
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[10px] font-black tracking-widest text-rose-600 uppercase">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  student.registrationStatus === "Registered"
                                    ? "bg-emerald-500"
                                    : student.registrationStatus === "Pending"
                                      ? "bg-amber-500"
                                      : "bg-slate-300"
                                }`}
                              />
                              <span className="text-xs font-bold text-slate-600">
                                {student.registrationStatus}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {student.parentId ? (
                              <div className="flex items-center gap-2 text-emerald-600">
                                <Link2 className="h-4 w-4" />
                                <span className="text-xs font-bold">
                                  Linked
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-amber-500">
                                <Link2Off className="h-4 w-4" />
                                <span className="text-xs font-bold">
                                  Unlinked
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!student.sectionId && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openAssignStudentModal(student)
                                  }}
                                  className="rounded-lg bg-rose-50 p-2 text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
                                  title="Assign Section"
                                >
                                  <GraduationCap className="h-4 w-4" />
                                </button>
                              )}
                              {!student.parentId && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setParentSearchQuery("")
                                    setLinkParentError(null)
                                    setStudentToLink(student)
                                  }}
                                  className="rounded-lg bg-primary/5 p-2 text-primary transition-all hover:bg-primary hover:text-white"
                                  title="Link Parent"
                                >
                                  <Link2 className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedStudent(student)
                                }}
                                className="rounded-lg bg-slate-50 p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                            <Search className="h-10 w-10 text-slate-200" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900">
                              No students found
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                              {activeTab === "unassigned"
                                ? "No unassigned students were found for this academic year."
                                : "Try adjusting your search or filters"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-slate-500">
                Page {currentPage} · {filteredStudentCount} total student
                {filteredStudentCount === 1 ? "" : "s"}
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
          </div>
        </div>
      </div>

      {/* Student Detail Side-Sheet */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-[101] flex w-full max-w-md flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <div
                  className={`rounded-full border px-3 py-1 text-[10px] font-black tracking-widest uppercase ${
                    selectedStudent.registrationStatus === "Registered"
                      ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                      : "border-amber-100 bg-amber-50 text-amber-600"
                  }`}
                >
                  {selectedStudent.registrationStatus}
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-full p-2 transition-all hover:bg-slate-100"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 space-y-8 overflow-auto p-8">
                <div className="flex flex-col items-center space-y-4 text-center">
                  <StudentAvatar
                    student={selectedStudent}
                    className="h-24 w-24 rounded-[2rem]"
                    iconClassName="w-12 h-12"
                    large
                  />
                  <div>
                    <h2 className="text-2xl leading-tight font-black tracking-tight text-slate-900">
                      {selectedStudent.name}
                    </h2>
                    <p className="mt-1 text-xs font-black tracking-widest text-slate-400 uppercase">
                      Roll: {selectedStudent.rollNo || "—"}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-2 text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                    Academic Info
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedStudent.sectionId
                      ? selectedStudent.grade
                      : "Unassigned"}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {selectedStudent.sectionId
                      ? `Section ${selectedStudent.section}`
                      : "No section assigned"}
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Parental Connection
                  </h4>
                  {selectedStudent.parentId ? (
                    <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-white">
                        <Link2 className="h-6 w-6 text-emerald-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-emerald-600">
                          {selectedStudentParent
                            ? [
                                selectedStudentParent.name,
                                selectedStudentParent.fatherName,
                              ]
                                .filter(Boolean)
                                .join(" ")
                            : "Parent Linked"}
                        </p>
                        {selectedStudentParent && (
                          <div className="mt-2 space-y-1 text-xs font-medium text-emerald-600">
                            <p>{selectedStudentParent.relationship || "Primary Contact"}</p>
                            <p>{selectedStudentParent.phone || "No phone number"}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-white">
                        <Link2Off className="h-6 w-6 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-amber-600">
                          No Parent Linked
                        </p>
                        <p className="mt-1 text-xs leading-none font-medium text-amber-500">
                          Manual linkage required
                        </p>
                      </div>
                      <button
                        onClick={() => setStudentToLink(selectedStudent)}
                        className="rounded-lg bg-amber-500 p-2 text-white transition-all hover:bg-amber-600 active:scale-95"
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Contact Methods
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        const parent = parents.find(
                          (p) => p.id === selectedStudent.parentId
                        )
                        setSmsStudent(selectedStudent)
                        setSmsPhone(parent?.phone || "")
                        setSmsMessage(
                          `Hello from EduGov Academy. We have an update regarding ${selectedStudent.name}.`
                        )
                        setIsSMSModalOpen(true)
                      }}
                      className="group flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-primary/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          Send SMS to Parent
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-primary" />
                    </button>
                    <button className="group flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          Call Emergency Contact
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-primary" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 border-t border-slate-100 p-6">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 py-3 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:bg-slate-100 hover:text-slate-600"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
                {!selectedStudent.sectionId && (
                  <button
                    onClick={() => openAssignStudentModal(selectedStudent)}
                    disabled={!academicYearId}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-rose-500/20 transition-all hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Assign
                  </button>
                )}
                <button
                  onClick={() => {
                    setStudentToDelete(selectedStudent)
                    setDeleteStudentError(null)
                  }}
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-500 transition-all hover:border-red-200 hover:bg-red-100"
                  title="Remove student"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {studentToDelete && (
          <div className="fixed inset-0 z-[240] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDeleteStudentModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            >
              <div className="border-b border-slate-100 p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50 shadow-sm">
                    <Trash2 className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900">
                      Remove Student
                    </h3>
                    <p className="text-xs font-bold tracking-widest text-red-500 uppercase">
                      This action is permanent
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 p-8">
                <p className="text-sm leading-relaxed font-medium text-slate-600">
                  Delete {studentToDelete.name} permanently. This student record
                  cannot be recovered after confirmation.
                </p>
                {deleteStudentError && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                    {deleteStudentError}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-4 border-t border-slate-100 p-8">
                <button
                  onClick={closeDeleteStudentModal}
                  disabled={isDeletingStudent}
                  className="px-6 py-3 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleDeleteStudent()}
                  disabled={isDeletingStudent}
                  className="flex min-w-36 items-center justify-center gap-2 rounded-xl bg-red-600 px-8 py-3 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-red-200 transition-all hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeletingStudent ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Confirm Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Student Modal */}
      <AnimatePresence>
        {studentToAssign && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAssignStudentModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 shadow-sm">
                    <GraduationCap className="h-6 w-6 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900">
                      Assign Student
                    </h3>
                    <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                      {studentToAssign.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeAssignStudentModal}
                  className="rounded-full p-2 transition-all hover:bg-slate-50"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-6 p-8">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Academic Year
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {academicYear}
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                      Grade
                    </label>
                    <select
                      value={assignForm.gradeId}
                      onChange={(e) =>
                        setAssignForm({
                          gradeId: e.target.value,
                          sectionId: "",
                          rollNo: assignForm.rollNo,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="">Select grade</option>
                      {grades.map((grade) => (
                        <option key={grade.id} value={grade.id}>
                          {grade.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                      Roll No
                    </label>
                    <input
                      type="text"
                      value={assignForm.rollNo}
                      onChange={(e) =>
                        setAssignForm((current) => ({
                          ...current,
                          rollNo: e.target.value,
                        }))
                      }
                      placeholder="Enter section roll number"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                    Section
                  </label>
                  <select
                    value={assignForm.sectionId}
                    onChange={(e) =>
                      setAssignForm((current) => ({
                        ...current,
                        sectionId: e.target.value,
                      }))
                    }
                    disabled={!assignForm.gradeId}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Select section</option>
                    {assignSectionsForSelectedGrade.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
                {assignStudentError && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {assignStudentError}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-4 border-t border-slate-100 p-8">
                <button
                  onClick={closeAssignStudentModal}
                  className="px-6 py-3 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-600"
                >
                  Cancel
                </button>
                <button
                  disabled={
                    isAssigningStudent ||
                    !academicYearId ||
                    !assignForm.gradeId ||
                    !assignForm.sectionId ||
                    !assignForm.rollNo.trim()
                  }
                  onClick={() => void handleAssignStudent()}
                  className="rounded-xl bg-rose-500 px-8 py-3 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-rose-500/20 transition-all hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAssigningStudent ? "Assigning..." : "Assign Student"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/10 bg-primary/5 shadow-sm">
                    <Edit3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900">
                      Edit Student
                    </h3>
                    <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                      Updating {selectedStudent.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-full p-2 transition-all hover:bg-slate-50"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-6 p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedStudent.name}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Roll No
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedStudent.rollNo}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-400 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Grade
                    </label>
                    <select
                      defaultValue={selectedStudent.grade}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {grades.map((g) => (
                        <option key={g.id} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Section
                    </label>
                    <select
                      defaultValue={selectedStudent.section}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {sectionNames.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Status
                    </label>
                    <select
                      defaultValue={selectedStudent.registrationStatus}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option>Registered</option>
                      <option>Pending</option>
                      <option>Withdrawn</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 border-t border-slate-100 p-8">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl bg-primary px-8 py-3 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SMS Modal */}
      <AnimatePresence>
        {isSMSModalOpen && smsStudent && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSMSModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl"
            >
              <div className="mb-8 space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/10 bg-primary/5">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Send SMS Notification
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    To parent of <b>{smsStudent.name}</b>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Recipient Number
                  </label>
                  <input
                    type="tel"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="+251 ..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Message Body
                  </label>
                  <textarea
                    rows={4}
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter message content..."
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setIsSMSModalOpen(false)}
                  className="flex-1 rounded-xl bg-slate-50 py-3.5 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsSMSModalOpen(false)}
                  className="flex-1 rounded-xl bg-primary py-3.5 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-95"
                >
                  Send SMS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Link Parent Modal */}
      <AnimatePresence>
        {studentToLink && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLinkParentModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl"
            >
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50">
                  <Link2 className="h-8 w-8 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Link Parent Account
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    Connecting parent for <b>{studentToLink.name}</b>
                  </p>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Search Parent (Name or Phone)
                  </label>
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g., +251 9..."
                      value={parentSearchQuery}
                      onChange={(event) =>
                        setParentSearchQuery(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-10 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                {linkParentError && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {linkParentError}
                  </div>
                )}
                {searchableParents.length > 0 ? (
                  <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                    {searchableParents.map((parent) => {
                      const linkedCount =
                        parent.linkedStudentCount ?? parent.linkedStudents.length
                      const isAlreadyLinkedToCurrentStudent = Boolean(
                        studentToLink &&
                          parent.linkedStudents.includes(studentToLink.id)
                      )
                      const linkStateLabel = isAlreadyLinkedToCurrentStudent
                        ? "Already linked"
                        : linkedCount === 0
                          ? "Unlinked"
                          : linkedCount === 1
                            ? "Linked to 1 student"
                            : `Linked to ${linkedCount} students`
                      const parentStatusLabel = parent.isActive
                        ? "Active"
                        : "Pending"

                      return (
                        <div
                          key={parent.id}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white">
                              <Users className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-900 uppercase">
                                {parent.name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {parent.phone || "No phone"}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-bold uppercase">
                                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-600">
                                  {linkStateLabel}
                                </span>
                                <span
                                  className={`rounded-full px-2 py-0.5 ${
                                    parent.isActive
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {parentStatusLabel}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              studentToLink &&
                              void handleLinkParent(studentToLink, parent)
                            }
                            disabled={
                              linkingParentId === parent.id ||
                              isAlreadyLinkedToCurrentStudent
                            }
                            className="rounded-lg bg-primary px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {linkingParentId === parent.id
                              ? "Connecting..."
                              : isAlreadyLinkedToCurrentStudent
                                ? "Linked"
                                : "Connect"}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-medium text-slate-500">
                    No parents match that search.
                  </div>
                )}
              </div>
              <button
                onClick={closeLinkParentModal}
                className="mt-6 w-full py-3 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-600"
              >
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/10 bg-primary/5 shadow-sm">
                    <UserPlus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900">
                      Manual Registration
                    </h3>
                    <p className="text-xs font-bold text-slate-500">
                      Register a student into the system
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => void closeAddStudentModal()}
                  className="rounded-full p-2 transition-all hover:bg-slate-50"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-6 p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John"
                      value={newStudentForm.firstName}
                      onChange={(e) =>
                        setNewStudentForm((current) => ({
                          ...current,
                          firstName: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Doe"
                      value={newStudentForm.lastName}
                      onChange={(e) =>
                        setNewStudentForm((current) => ({
                          ...current,
                          lastName: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                      Roll No
                    </label>
                    <input
                      type="text"
                      placeholder="ST-2025-..."
                      value={newStudentForm.rollNo}
                      onChange={(e) =>
                        setNewStudentForm((current) => ({
                          ...current,
                          rollNo: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                      Gender
                    </label>
                    <select
                      value={newStudentForm.gender}
                      onChange={(e) =>
                        setNewStudentForm((current) => ({
                          ...current,
                          gender: e.target.value as StudentGender,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                      Grade
                    </label>
                    <select
                      value={newStudentForm.gradeId}
                      onChange={(e) =>
                        setNewStudentForm((current) => ({
                          ...current,
                          gradeId: e.target.value,
                          sectionId: "",
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select grade</option>
                      {grades.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                      Section
                    </label>
                    <select
                      value={newStudentForm.sectionId}
                      onChange={(e) =>
                        setNewStudentForm((current) => ({
                          ...current,
                          sectionId: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
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
                    <label className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                      Status
                    </label>
                    <select
                      value={newStudentForm.status}
                      onChange={(e) =>
                        setNewStudentForm((current) => ({
                          ...current,
                          status: e.target.value as StudentStatus,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="ACTIVE">Registered</option>
                      <option value="INACTIVE">Pending</option>
                      <option value="WITHDRAWN">Withdrawn</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={newStudentForm.dateOfBirth}
                      onChange={(e) =>
                        setNewStudentForm((current) => ({
                          ...current,
                          dateOfBirth: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                      Admission Date
                    </label>
                    <input
                      type="date"
                      value={newStudentForm.admissionDate}
                      onChange={(e) =>
                        setNewStudentForm((current) => ({
                          ...current,
                          admissionDate: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <MediaUploader
                  accept="image/*"
                  imageOnly
                  label="Student Photo"
                  description="Upload a student profile image"
                  onUploaded={(mediaId) =>
                    setStudentPhotoState((current) => ({
                      ...current,
                      mediaId,
                    }))
                  }
                  onRemoved={() =>
                    setStudentPhotoState((current) => ({
                      ...current,
                      mediaId: null,
                    }))
                  }
                  onStateChange={setStudentPhotoState}
                  onBusyChange={setIsStudentMediaBusy}
                />
                {studentFormError && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {studentFormError}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-4 border-t border-slate-100 p-8">
                <button
                  onClick={() => void closeAddStudentModal()}
                  className="px-6 py-3 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-600"
                >
                  Cancel
                </button>
                <button
                  disabled={
                    isSubmittingStudent ||
                    isStudentMediaBusy ||
                    !branchId ||
                    !organizationId ||
                    !academicYearId ||
                    !newStudentForm.firstName ||
                    !newStudentForm.lastName ||
                    !newStudentForm.rollNo ||
                    !newStudentForm.sectionId ||
                    !newStudentForm.dateOfBirth ||
                    !newStudentForm.admissionDate
                  }
                  onClick={async () => {
                    if (!branchId || !organizationId || !academicYearId) {
                      setStudentFormError(
                        "Branch, organization, and academic year context are required."
                      )
                      return
                    }
                    setIsSubmittingStudent(true)
                    setStudentFormError(null)
                    try {
                      await studentsApi.create({
                        organization: organizationId,
                        branch: branchId,
                        academic_year: academicYearId,
                        first_name: newStudentForm.firstName.trim(),
                        last_name: newStudentForm.lastName.trim(),
                        gender: newStudentForm.gender,
                        date_of_birth: newStudentForm.dateOfBirth,
                        roll_no: newStudentForm.rollNo.trim(),
                        current_section: newStudentForm.sectionId,
                        admission_date: newStudentForm.admissionDate,
                        photo: studentPhotoState.mediaId ?? undefined,
                        status: newStudentForm.status,
                      })
                      await deleteQueuedMedia(
                        studentPhotoState.pendingRemovalIds
                      )
                      resetStudentForm()
                      setIsAddModalOpen(false)
                      refetchDirectoryStudents()
                      refetchAllStudents()
                    } catch (error) {
                      setStudentFormError(
                        error instanceof Error
                          ? error.message
                          : "Failed to register student."
                      )
                    } finally {
                      setIsSubmittingStudent(false)
                    }
                  }}
                  className="rounded-xl bg-primary px-8 py-3 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingStudent ? "Registering..." : "Register Student"}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeImportModal}
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
                  Bulk Student Import
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  Upload Excel or CSV file to import student directory
                </p>
              </div>
              <label className="block">
                <div className="group mt-4 cursor-pointer rounded-[2rem] border-2 border-dashed border-slate-200 p-12 transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
                  <div className="space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm transition-transform group-hover:scale-110">
                      <ArrowUpDown className="h-6 w-6 text-slate-300 transition-colors group-hover:text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-black tracking-tight text-slate-900">
                        {importFile
                          ? importFile.name
                          : "Click or drag file to upload"}
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
                  className="hidden"
                  onChange={(event) =>
                    setImportFile(event.target.files?.[0] ?? null)
                  }
                />
              </label>
              <p className="text-xs text-slate-500">
                The backend will validate the uploaded student file before
                creating records. Grade and section are optional, but selecting
                a grade requires selecting a section too.
              </p>
              <div className="grid gap-4 text-left md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                    Grade
                  </label>
                  <select
                    value={importGradeId}
                    onChange={(event) => {
                      setImportGradeId(event.target.value)
                      setImportSectionId("")
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select grade</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] leading-none font-black tracking-widest text-slate-400 uppercase">
                    Section
                  </label>
                  <select
                    value={importSectionId}
                    onChange={(event) => setImportSectionId(event.target.value)}
                    disabled={!importGradeId}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Select section</option>
                    {importSectionsForSelectedGrade.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {(isImporting || importTaskId) && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-700">
                      {importTaskId
                        ? `Import job ${importTaskId.slice(0, 8)}...`
                        : "Starting import..."}
                    </p>
                    <span className="text-xs font-black tracking-widest text-primary uppercase">
                      {importProgress}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {importErrorMessages.length > 0 && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-left text-sm text-red-700">
                  <div className="space-y-1">
                    {importErrorMessages.map((message) => (
                      <p key={message}>{message}</p>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-center gap-6 pt-4">
                <button
                  onClick={closeImportModal}
                  className="text-[10px] font-black tracking-widest text-slate-400 uppercase hover:text-slate-600"
                >
                  Cancel
                </button>
                <div className="h-4 w-px bg-slate-100" />
                <button
                  disabled={
                    !importFile ||
                    isImporting ||
                    Boolean(importGradeId && !importSectionId)
                  }
                  onClick={() => void handleStudentImport()}
                  className="text-[10px] font-black tracking-widest text-primary uppercase hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
                >
                  {isImporting ? "Importing..." : "Upload File"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StudentAvatar({
  student,
  className,
  iconClassName,
  large = false,
}: {
  student: Student
  className: string
  iconClassName: string
  large?: boolean
}) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    resolveMediaUrl(student.photoUrl ?? null)
      .then((url) => {
        if (!cancelled) {
          setResolvedUrl(url)
        }
      })
      .catch((error) => {
        console.error("Failed to resolve student photo:", error)
        if (!cancelled) {
          setResolvedUrl(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [student.photoUrl])

  return (
    <div
      className={`${className} relative flex items-center justify-center overflow-hidden border border-slate-100 bg-slate-50`}
    >
      {resolvedUrl ? (
        <Image
          src={resolvedUrl}
          alt={student.name}
          fill
          unoptimized
          sizes={large ? "6rem" : "2.5rem"}
          className="object-cover"
        />
      ) : (
        <GraduationCap className={`${iconClassName} text-slate-300`} />
      )}
      {large && (
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-primary/5 to-transparent" />
      )}
    </div>
  )
}
