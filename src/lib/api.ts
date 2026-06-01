/**
 * kelem-api client — lightweight and robust fetch wrapper for Djoser JWT authentication.
 */

import { createMediaClient } from "./media/mediaClient"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

// ---------------------------------------------------------------------------
// Shared error class — exported so hooks can do `instanceof ApiError`
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

/** Extract a human-readable message from any thrown value. */
export function extractApiError(err: unknown): string {
  return extractUserReadableErrorMessages(err).join(" · ")
}

function humanizeErrorField(field: string): string {
  const labels: Record<string, string> = {
    email: "Email",
    phone_number: "Phone number",
    father_name: "Father name",
    grandfather_name: "Grandfather name",
    emergency_contact_name: "Emergency contact name",
    emergency_contact_phone: "Emergency contact phone",
    secondary_phone_number: "Secondary phone",
    work_address: "Work address",
    relationship_notes: "Relationship notes",
  }
  return labels[field] ?? field.replaceAll("_", " ")
}

function parseStructuredErrorMessages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      if (
        entry &&
        typeof entry === "object" &&
        "row" in entry &&
        "errors" in entry &&
        entry.errors &&
        typeof entry.errors === "object"
      ) {
        const rowMessages = Object.entries(
          entry.errors as Record<string, unknown>
        ).flatMap(([field, fieldValue]) => {
          const messages = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
          return messages.map(
            (message) => `${humanizeErrorField(field)}: ${String(message)}`
          )
        })
        return rowMessages.length > 0
          ? [`Row ${String(entry.row)}: ${rowMessages.join(" | ")}`]
          : [`Row ${String(entry.row)}: Invalid data.`]
      }
      if (entry && typeof entry === "object") {
        return Object.entries(entry as Record<string, unknown>).flatMap(
          ([field, fieldValue]) => {
            const messages = Array.isArray(fieldValue)
              ? fieldValue
              : [fieldValue]
            return messages.map(
              (message) => `${humanizeErrorField(field)}: ${String(message)}`
            )
          }
        )
      }
      return String(entry).trim() ? [String(entry)] : []
    })
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([field, fieldValue]) => {
        const messages = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
        return messages.map(
          (message) => `${humanizeErrorField(field)}: ${String(message)}`
        )
      }
    )
  }

  return []
}

export function extractUserReadableErrorMessages(err: unknown): string[] {
  const e = err as Record<string, any>
  const structuredData = e?.data?.errors ?? e?.data ?? err
  const serializedError = (() => {
    try {
      return JSON.stringify(err)
    } catch {
      return ""
    }
  })()

  const rawDetail =
    (typeof e?.data?.detail === "string" && e.data.detail) ||
    (typeof e?.detail === "string" && e.detail) ||
    (typeof e?.message === "string" && e.message) ||
    ""

  if (
    /upload_not_pending/i.test(rawDetail) ||
    /multipart upload is not available for this media item/i.test(rawDetail) ||
    /upload_not_pending/i.test(serializedError) ||
    /multipart upload is not available for this media item/i.test(
      serializedError
    )
  ) {
    return ["Something went wrong. Try again later."]
  }

  const structuredMessages = parseStructuredErrorMessages(structuredData)
  if (structuredMessages.length > 0) return structuredMessages

  const rawMessage =
    (typeof structuredData === "string" && structuredData) ||
    e?.data?.detail ||
    e?.message ||
    ""

  if (typeof rawMessage === "string" && rawMessage.trim()) {
    try {
      const parsed = JSON.parse(rawMessage)
      const parsedMessages = parseStructuredErrorMessages(parsed)
      if (parsedMessages.length > 0) return parsedMessages
    } catch {
      // ignore parse failure and continue
    }

    if (/API request failed with status 400/i.test(rawMessage)) {
      return [
        "The server could not process this file. Check the data and try again.",
      ]
    }
    if (/API request failed with status 401|403/i.test(rawMessage)) {
      return ["You do not have permission to complete this import."]
    }
    if (/API request failed with status 404/i.test(rawMessage)) {
      return ["The import service could not be reached. Try again shortly."]
    }
    if (/API request failed with status 413/i.test(rawMessage)) {
      return [
        "The selected file is too large. Use a smaller file and try again.",
      ]
    }
    if (/API request failed with status 5\d\d/i.test(rawMessage)) {
      return [
        "The server ran into a problem while processing the import. Try again shortly.",
      ]
    }

    return rawMessage
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
  }

  return [
    "Something went wrong while processing your request. Please try again.",
  ]
}

// ---------------------------------------------------------------------------
// Paginated response envelope
// ---------------------------------------------------------------------------
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ---------------------------------------------------------------------------
// Auth / User types
// ---------------------------------------------------------------------------
export interface ApiUser {
  id: string
  email: string
  name: string
  father_name: string
  grandfather_name: string
  phone_number: string
  address: string
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface BranchAdminProfile {
  id: string
  organization: string
  organization_name?: string
  branch: string
  branch_name?: string
  user: string
  role_title: string
  status: string
}

export interface ApiBranch {
  id: string
  organization: string
  school: string
  name: string
  address: string
  city: string
  region: string
  contact_phone: string
  contact_email: string
  status: string
  created_at: string
  updated_at: string
}

export interface JWTResponse {
  access: string
  refresh: string
}

export interface RefreshTokenResponse {
  access: string
  refresh?: string
}

export type UserRole = "ORGANIZATION" | "BRANCH_ADMIN" | "TEACHER" | "PARENT"

export interface AuthUserCreate {
  email: string
  password: string
  name: string
  father_name: string
  grandfather_name: string
  phone_number: string
  address: string
  role: UserRole
}

// ---------------------------------------------------------------------------
// Academia types
// ---------------------------------------------------------------------------
export interface ApiGrade {
  id: string
  organization: string
  branch: string
  name: string
  level: number
}

export interface ApiSection {
  id: string
  organization: string
  branch: string
  grade: string
  academic_year: string
  name: string
}

export interface ApiSubject {
  id: string
  organization: string
  branch: string
  grade: string
  name: string
  code: string
}

export interface AcademicYear {
  id: string
  organization: string
  branch: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
}

// ---------------------------------------------------------------------------
// Student types
// ---------------------------------------------------------------------------
export type StudentStatus = "ACTIVE" | "INACTIVE" | "WITHDRAWN" | "GRADUATED"
export type StudentGender = "MALE" | "FEMALE" | "OTHER"

export interface ApiStudent {
  id: string
  organization: string
  branch: string
  first_name: string
  last_name: string
  gender: StudentGender
  date_of_birth: string
  roll_no: string
  current_section: string | null
  admission_date: string
  photo: string | null
  status: StudentStatus
  // Read extras
  section_name: string | null
  grade_id: string | null
  grade_name: string | null
  grade_level: number | null
  academic_year_id: string | null
  academic_year_name: string | null
  branch_name: string
  organization_name: string
}

export interface ApiStudentWrite {
  organization: string
  branch: string
  academic_year: string
  first_name: string
  last_name: string
  gender: StudentGender
  date_of_birth: string
  roll_no: string
  current_section?: string | null
  admission_date: string
  photo?: string | null
  status?: StudentStatus
}

// ---------------------------------------------------------------------------
// Parent types
// ---------------------------------------------------------------------------
export interface ApiParent {
  id: string
  user: string
  organizations: string[]
  branches: string[]
  secondary_phone_number: string
  occupation: string
  work_address: string
  relationship_notes: string
  emergency_contact_name: string
  emergency_contact_phone: string
  is_active: boolean
  // Read extras
  user_details: {
    id: string
    name: string
    email: string
    father_name?: string
    grandfather_name?: string
    phone_number: string
  }
  student_details: Array<{
    id: string
    first_name: string
    last_name: string
    grade_name: string
    section_name: string
  }>
}

export interface ApiParentWrite {
  user: string
  organizations: string[]
  branches: string[]
  secondary_phone_number?: string
  occupation?: string
  work_address?: string
  relationship_notes?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  is_active?: boolean
}

export interface ApiParentInvitePayload {
  name: string
  email?: string
  father_name: string
  grandfather_name: string
  phone_number: string
  branch: string
  secondary_phone_number?: string
  occupation?: string
  work_address?: string
  relationship_notes?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}

export interface ApiActionResponse {
  success?: boolean
  message?: string
  invitation_url?: string
}

// ---------------------------------------------------------------------------
// Teacher types
// ---------------------------------------------------------------------------
export interface ApiTeacher {
  id: string
  user: string
  organization: string
  branch: string
  employee_id: string
  bio: string
  specialization: string
  joining_date: string
  is_active?: boolean | number | string | null
  father_name?: string
  grandfather_name?: string
  invitation_status?: string
  // Read extras
  user_name: string
  user_father_name?: string
  user_grandfather_name?: string
  user_email: string
  user_phone_number?: string
  qualifications: ApiTeacherQualification[]
}

export interface ApiTeacherStatus {
  teacher_id: string
  user_id: string
  is_active: boolean
  verified_at: string | null
}

export interface ApiTeacherWrite {
  user: string
  organization: string
  branch: string
  employee_id: string
  bio?: string
  specialization?: string
  joining_date?: string
}

export interface ApiTeacherInvitePayload {
  email: string
  name: string
  father_name: string
  grandfather_name: string
  phone_number: string
  specialization?: string
  branch: string
}

export interface ApiTeacherQualification {
  id: string
  teacher: string
  organization: string
  degree_name: string
  institution: string
  field_of_study: string
  completion_date: string
  certificate_copy: string | null
}

export interface ApiTeacherAssignment {
  id: string
  teacher: string
  organization: string
  subject: string
  section: string
  academic_year: string
  // Read extras
  teacher_name: string
  teacher_employee_id: string
  subject_name: string
  subject_code: string
  section_name: string
  grade_name: string
  academic_year_name: string
}

export interface ApiTeacherAssignmentWrite {
  teacher: string
  organization: string
  subject: string
  section: string
  academic_year: string
}

// ---------------------------------------------------------------------------
// Homeroom assignment type
// ---------------------------------------------------------------------------
export interface ApiHomeroomAssignment {
  id: string
  organization: string
  branch: string
  academic_year: string
  section: string
  teacher: string
  notes: string
  // Read extras
  teacher_name: string
  section_name: string
  grade_name: string
}

export interface ApiHomeroomAssignmentWrite {
  organization: string
  branch: string
  academic_year: string
  section: string
  teacher: string
  notes?: string
}

// ---------------------------------------------------------------------------
// Attendance types
// ---------------------------------------------------------------------------
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"

export interface ApiAttendanceRecord {
  id: string
  organization: string
  branch: string
  academic_year: string
  section: string
  student: string
  date: string
  status: AttendanceStatus
  remarks: string
  // Read extras
  student_name: string
  student_roll_no: string
  section_name: string
  grade_name: string
  recorded_by_name: string
  status_display: string
}

export interface ApiAttendanceSummary {
  id: string
  organization: string
  student: string
  student_name: string
  academic_year: string
  academic_year_name: string
  total_present: number
  total_absent: number
  total_late: number
  total_excused: number
  total_school_days: number
  attendance_rate: number
  last_updated: string
}

export interface ApiDailyAttendanceStatus {
  section: string
  section_name: string
  grade_name: string
  date: string
  total_students: number
  present: number
  absent: number
  late: number
  excused: number
  attendance_rate: number
  is_marked: boolean
  recorded_by: string | null
  recorded_at: string | null
}

export interface ApiDailyAttendanceStatusResponse {
  date: string
  count: number
  results: ApiDailyAttendanceStatus[]
}

export interface ApiBulkAttendanceSubmit {
  section: string
  academic_year: string
  organization: string
  branch: string
  date: string
  records: Array<{
    student: string
    status: AttendanceStatus
    remarks?: string
    client_side_id?: string
  }>
}

export interface ApiBulkAttendanceResult {
  created: number
  skipped: number
  errors: unknown[]
  created_ids: string[]
}

// ---------------------------------------------------------------------------
// Announcement types
// ---------------------------------------------------------------------------
export type AnnouncementTargetRole = "PARENTS" | "TEACHERS" | "BOTH"
export type AnnouncementStatus = "DRAFT" | "SENT" | "SCHEDULED"

export interface ApiAnnouncement {
  id: string
  organization: string
  branch: string
  subject: string
  message: string
  attachment?: string | null
  scheduled_at?: string | null
  is_urgent: boolean
  status: AnnouncementStatus
  target_roles: AnnouncementTargetRole
  targeted_grades: string[]
  targeted_sections: string[]
  created_at?: string
  updated_at?: string
}

export interface ApiAnnouncementWrite {
  organization: string
  branch: string
  subject: string
  message: string
  attachment?: string | null
  scheduled_at?: string | null
  is_urgent?: boolean
  status: AnnouncementStatus
  target_roles: AnnouncementTargetRole
  targeted_grades?: string[]
  targeted_sections?: string[]
}

export interface ApiAnnouncementTargetingCriteria {
  grades: Array<{ id: string; name: string; level: number }>
  sections: Array<{ id: string; name: string; grade_name: string }>
}

export type ApiCalendarEventCategory =
  | "Exam"
  | "Holiday"
  | "Meeting"
  | "School Event"

export interface ApiCalendarEvent {
  id: string
  organization: string
  branch: string
  academic_year?: string | null
  title: string
  description: string
  start_date: string
  end_date: string
  start_time?: string | null
  end_time?: string | null
  category: ApiCalendarEventCategory
  target_roles: AnnouncementTargetRole
  targeted_grades: string[]
  targeted_sections: string[]
  linked_announcement_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface ApiCalendarEventWrite {
  organization: string
  branch: string
  academic_year?: string | null
  title: string
  description: string
  start_date: string
  end_date: string
  start_time?: string | null
  end_time?: string | null
  category: ApiCalendarEventCategory
  target_roles: AnnouncementTargetRole
  targeted_grades?: string[]
  targeted_sections?: string[]
  linked_announcement_id?: string | null
}

export interface ApiCalendarDocument {
  id: string
  organization: string
  branch: string
  academic_year?: string | null
  media_file: string | null
  file_name?: string | null
  created_at?: string
  updated_at?: string
}

// ---------------------------------------------------------------------------
// Media / import types
// ---------------------------------------------------------------------------
export interface ApiMediaFile {
  id: string
  key?: string
  bucket?: string
  file_name?: string
  content_type?: string
  size?: number
  etag?: string | null
  status?: "pending" | "uploaded" | "failed" | "deleted"
  download_url?: string
  created_at?: string
  updated_at?: string
}

export interface ApiMediaUploadInit {
  id: string
  key: string
  upload_id: string
  expires_in: number
}

export interface ApiMediaPartUrl {
  presigned_url: string
  expires_in: number
}

export interface ApiMultipartCompleteResult {
  id: string
  status: "uploaded" | "pending" | "failed" | "deleted"
  etag: string
  size: number
}

export interface ApiImportJob {
  id?: string
  task_id?: string
  status: "pending" | "processing" | "success" | "failed"
  progress: number
  errors: unknown
  module?: string
  organization?: string
  branch?: string
  created_at?: string
  updated_at?: string
  detail?: string
}

// ---------------------------------------------------------------------------
// Parent link type
// ---------------------------------------------------------------------------
export interface ApiParentLink {
  id: string
  student: string
  parent: string
  relationship_type: string
  is_primary_contact: boolean
  // Read extras
  student_details: { id: string; first_name: string; last_name: string }
  parent_details: { id: string; user_details: { name: string; email: string } }
}

// ---------------------------------------------------------------------------
// Token manager
// ---------------------------------------------------------------------------
export const tokenManager = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("branch_admin_access_token")
  },
  setAccessToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("branch_admin_access_token", token)
    }
  },
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("branch_admin_refresh_token")
  },
  setRefreshToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("branch_admin_refresh_token", token)
    }
  },
  clearTokens() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("branch_admin_access_token")
      localStorage.removeItem("branch_admin_refresh_token")
    }
  },
}

let refreshPromise: Promise<string | null> | null = null

async function readResponseBody(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    try {
      return await response.text()
    } catch {
      return null
    }
  }
}

async function parseResponseData<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return (await response.json()) as T
  }
  return null as unknown as T
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const refresh = tokenManager.getRefreshToken()
    if (!refresh) {
      tokenManager.clearTokens()
      return null
    }

    try {
      const refreshRes = await fetch(
        `${API_BASE_URL.replace(/\/$/, "")}/auth/jwt/refresh/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        }
      )

      if (!refreshRes.ok) {
        tokenManager.clearTokens()
        return null
      }

      const data =
        (await parseResponseData<RefreshTokenResponse>(refreshRes)) || null
      if (!data?.access) {
        tokenManager.clearTokens()
        return null
      }

      tokenManager.setAccessToken(data.access)
      if (data.refresh) {
        tokenManager.setRefreshToken(data.refresh)
      }

      return data.access
    } catch {
      tokenManager.clearTokens()
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------
export async function request<T>(
  path: string,
  options: RequestInit = {},
  skipAuth = false
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`

  const headers = new Headers(options.headers || {})
  if (
    !headers.has("Content-Type") &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json")
  }

  if (!skipAuth) {
    const token = tokenManager.getAccessToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }

  const fetchOptions: RequestInit = { ...options, headers }
  let response: Response
  try {
    response = await fetch(url, fetchOptions)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach the server."
    throw new ApiError(message, 0, error)
  }

  if (response.status === 401 && !skipAuth) {
    const refreshedAccessToken = await refreshAccessToken()
    if (refreshedAccessToken) {
      const retryHeaders = new Headers(headers)
      retryHeaders.set("Authorization", `Bearer ${refreshedAccessToken}`)
      const retryResponse = await fetch(url, {
        ...fetchOptions,
        headers: retryHeaders,
      })
      if (retryResponse.ok) {
        return parseResponseData<T>(retryResponse)
      }

      const retryErrorData = await readResponseBody(retryResponse)
      const retryError = retryErrorData as Record<string, any> | null
      throw new ApiError(
        retryError?.detail ||
          retryError?.message ||
          `API request failed with status ${retryResponse.status}`,
        retryResponse.status,
        retryErrorData
      )
    }
  }

  if (!response.ok) {
    const errData = await readResponseBody(response)
    const e = errData as Record<string, any> | null
    throw new ApiError(
      e?.detail ||
        e?.message ||
        `API request failed with status ${response.status}`,
      response.status,
      errData
    )
  }

  return parseResponseData<T>(response)
}

function unwrapEnvelope<T>(
  payload: T | { data?: T } | { message?: string; data?: T }
): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>) &&
    (payload as { data?: T }).data !== undefined
  ) {
    return (payload as { data: T }).data
  }
  return payload as T
}

const mediaClient = createMediaClient({ request })

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------
export const authApi = {
  async registerUser(data: AuthUserCreate): Promise<ApiUser> {
    return request<ApiUser>(
      "/auth/users/",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true
    )
  },

  async login(email: string, password: string): Promise<JWTResponse> {
    const res = await request<JWTResponse>(
      "/auth/jwt/create/",
      { method: "POST", body: JSON.stringify({ email, password }) },
      true
    )
    tokenManager.setAccessToken(res.access)
    tokenManager.setRefreshToken(res.refresh)
    return res
  },

  async getCurrentUser(): Promise<ApiUser> {
    return request<ApiUser>("/api/users/me/", { method: "GET" })
  },

  async refreshSession(): Promise<boolean> {
    const access = await refreshAccessToken()
    return Boolean(access)
  },

  async completeInvitation(
    uid: string,
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return request<{ message: string }>(
      "/api/branch-admins/complete-invitation/",
      {
        method: "POST",
        body: JSON.stringify({ uid, token, new_password: newPassword }),
      },
      true
    )
  },

  logout() {
    tokenManager.clearTokens()
  },

  async resetPassword(data: { email: string }): Promise<void> {
    await request<void>(
      "/auth/users/reset_password/",
      { method: "POST", body: JSON.stringify(data) },
      true
    )
  },

  async resetPasswordConfirm(data: {
    uid: string
    token: string
    new_password: string
  }): Promise<void> {
    await request<void>(
      "/auth/users/reset_password_confirm/",
      { method: "POST", body: JSON.stringify(data) },
      true
    )
  },

  async getBranchAdminProfile(): Promise<BranchAdminProfile | null> {
    const res = await request<PaginatedResponse<BranchAdminProfile>>(
      "/api/branch-admins/",
      { method: "GET" }
    )
    return res?.results?.[0] || null
  },
}

export const branchesApi = {
  async getBranch(branchId: string): Promise<ApiBranch> {
    return request<ApiBranch>(`/api/branches/${branchId}/`, { method: "GET" })
  },

  async getSchoolName(branchId: string): Promise<string | null> {
    const response = await request<unknown>(
      `/api/branches/${branchId}/school-name/`,
      { method: "GET" }
    )

    if (typeof response === "string") {
      return response.trim() || null
    }

    if (response && typeof response === "object") {
      const data = response as Record<string, unknown>
      const schoolName =
        data.school_name ?? data.schoolName ?? data.name ?? data.school

      if (typeof schoolName === "string") {
        return schoolName.trim() || null
      }
    }

    return null
  },
}

// ---------------------------------------------------------------------------
// Academia API
// ---------------------------------------------------------------------------
export const academiaApi = {
  // Academic Years
  async getAcademicYears(branchId: string): Promise<AcademicYear[]> {
    const res = await request<PaginatedResponse<AcademicYear>>(
      `/api/academic-years/?branch=${branchId}`
    )
    return res.results || []
  },

  // Grades
  async getGrades(branchId: string): Promise<ApiGrade[]> {
    const res = await request<PaginatedResponse<ApiGrade>>(
      `/api/grades/?branch=${branchId}`
    )
    return res.results || []
  },
  async createGrade(data: Omit<ApiGrade, "id">): Promise<ApiGrade> {
    return request<ApiGrade>("/api/grades/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  async updateGrade(
    id: string,
    data: Partial<Omit<ApiGrade, "id">>
  ): Promise<ApiGrade> {
    return request<ApiGrade>(`/api/grades/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  async deleteGrade(id: string): Promise<void> {
    await request<void>(`/api/grades/${id}/`, { method: "DELETE" })
  },

  // Sections
  async getSections(
    branchId: string,
    academicYearId?: string
  ): Promise<ApiSection[]> {
    const params = new URLSearchParams({ branch: branchId })
    if (academicYearId) params.set("academic_year", academicYearId)
    const res = await request<PaginatedResponse<ApiSection>>(
      `/api/sections/?${params.toString()}`
    )
    return res.results || []
  },
  async createSection(data: Omit<ApiSection, "id">): Promise<ApiSection> {
    return request<ApiSection>("/api/sections/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  async updateSection(
    id: string,
    data: Partial<Omit<ApiSection, "id">>
  ): Promise<ApiSection> {
    return request<ApiSection>(`/api/sections/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  async deleteSection(id: string): Promise<void> {
    await request<void>(`/api/sections/${id}/`, { method: "DELETE" })
  },

  // Subjects
  async getSubjects(branchId: string): Promise<ApiSubject[]> {
    const res = await request<PaginatedResponse<ApiSubject>>(
      `/api/subjects/?branch=${branchId}`
    )
    return res.results || []
  },
  async createSubject(data: Omit<ApiSubject, "id">): Promise<ApiSubject> {
    return request<ApiSubject>("/api/subjects/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  async updateSubject(
    id: string,
    data: Partial<Omit<ApiSubject, "id">>
  ): Promise<ApiSubject> {
    return request<ApiSubject>(`/api/subjects/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  async deleteSubject(id: string): Promise<void> {
    await request<void>(`/api/subjects/${id}/`, { method: "DELETE" })
  },

  // Grade–Subject link
  async linkGradeSubject(
    organization: string,
    grade: string,
    subject: string
  ): Promise<unknown> {
    return request("/api/grade-subjects/", {
      method: "POST",
      body: JSON.stringify({ organization, grade, subject }),
    })
  },
}

// ---------------------------------------------------------------------------
// Students API
// ---------------------------------------------------------------------------
export const studentsApi = {
  async list(params: {
    branch?: string
    organization?: string
    section?: string
    grade?: string
    academic_year?: string
    status?: StudentStatus
    search?: string
    ordering?: string
    page?: number
  }): Promise<PaginatedResponse<ApiStudent>> {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
    })
    return request<PaginatedResponse<ApiStudent>>(
      `/api/students/?${q.toString()}`
    )
  },

  async get(id: string): Promise<ApiStudent> {
    return request<ApiStudent>(`/api/students/${id}/`)
  },

  async create(data: ApiStudentWrite): Promise<ApiStudent> {
    return request<ApiStudent>("/api/students/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async update(
    id: string,
    data: Partial<ApiStudentWrite>
  ): Promise<ApiStudent> {
    return request<ApiStudent>(`/api/students/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

  async delete(id: string): Promise<void> {
    await request<void>(`/api/students/${id}/`, { method: "DELETE" })
  },

  async bySection(sectionId: string): Promise<ApiStudent[]> {
    return request<ApiStudent[]>(
      `/api/students/by-section/?section=${sectionId}`
    )
  },

  async byGrade(gradeId: string): Promise<ApiStudent[]> {
    return request<ApiStudent[]>(`/api/students/by-grade/?grade=${gradeId}`)
  },
}

// ---------------------------------------------------------------------------
// Parents API
// ---------------------------------------------------------------------------
export const parentsApi = {
  async list(params: {
    branch?: string
    organization?: string
    search?: string
    is_active?: boolean
    page?: number
  }): Promise<PaginatedResponse<ApiParent>> {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
    })
    return request<PaginatedResponse<ApiParent>>(
      `/api/parents/?${q.toString()}`
    )
  },

  async get(id: string): Promise<ApiParent> {
    return request<ApiParent>(`/api/parents/${id}/`)
  },

  async create(data: ApiParentWrite): Promise<ApiParent> {
    return request<ApiParent>("/api/parents/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: Partial<ApiParentWrite>): Promise<ApiParent> {
    return request<ApiParent>(`/api/parents/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

  async invite(data: ApiParentInvitePayload): Promise<ApiActionResponse> {
    return request<ApiActionResponse>("/api/parents/invite/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async byBranch(branchId: string): Promise<ApiParent[]> {
    return request<ApiParent[]>(`/api/parents/by-branch/?branch=${branchId}`)
  },

  async getStudents(parentId: string): Promise<ApiStudent[]> {
    return request<ApiStudent[]>(`/api/parents/${parentId}/students/`)
  },

  // Parent links
  async createLink(data: {
    student: string
    parent: string
    relationship_type: string
    is_primary_contact: boolean
  }): Promise<ApiParentLink> {
    return request<ApiParentLink>("/api/parent-links/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async deleteLink(linkId: string): Promise<void> {
    await request<void>(`/api/parent-links/${linkId}/`, { method: "DELETE" })
  },

  async listLinks(params: {
    student?: string
    parent?: string
    page?: number
  }): Promise<PaginatedResponse<ApiParentLink>> {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v)
    })
    return request<PaginatedResponse<ApiParentLink>>(
      `/api/parent-links/?${q.toString()}`
    )
  },
}

// ---------------------------------------------------------------------------
// Teachers API
// ---------------------------------------------------------------------------
export const teachersApi = {
  async list(params: {
    branch?: string
    organization?: string
    search?: string
    page?: number
  }): Promise<PaginatedResponse<ApiTeacher>> {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
    })
    return request<PaginatedResponse<ApiTeacher>>(
      `/api/teachers/?${q.toString()}`
    )
  },

  async get(id: string): Promise<ApiTeacher> {
    return request<ApiTeacher>(`/api/teachers/${id}/`)
  },

  async getStatus(id: string): Promise<ApiTeacherStatus> {
    return request<ApiTeacherStatus>(`/api/teachers/${id}/status/`)
  },

  async create(data: ApiTeacherWrite): Promise<ApiTeacher> {
    return request<ApiTeacher>("/api/teachers/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async invite(data: ApiTeacherInvitePayload): Promise<ApiActionResponse> {
    return request<ApiActionResponse>("/api/teachers/invite/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async completeInvitation(
    uid: string,
    token: string,
    newPassword: string
  ): Promise<ApiActionResponse> {
    return request<ApiActionResponse>(
      "/api/teachers/complete-invitation/",
      {
        method: "POST",
        body: JSON.stringify({ uid, token, new_password: newPassword }),
      },
      true
    )
  },

  async getAssignments(teacherId: string): Promise<ApiTeacherAssignment[]> {
    return request<ApiTeacherAssignment[]>(
      `/api/teachers/${teacherId}/assignments/`
    )
  },

  async listAssignments(params: {
    teacher?: string
    section?: string
    subject?: string
    academic_year?: string
    organization?: string
    page?: number
  }): Promise<PaginatedResponse<ApiTeacherAssignment>> {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v)
    })
    return request<PaginatedResponse<ApiTeacherAssignment>>(
      `/api/teacher-assignments/?${q.toString()}`
    )
  },

  async createAssignment(
    data: ApiTeacherAssignmentWrite
  ): Promise<ApiTeacherAssignment> {
    return request<ApiTeacherAssignment>("/api/teacher-assignments/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async deleteAssignment(id: string): Promise<void> {
    await request<void>(`/api/teacher-assignments/${id}/`, { method: "DELETE" })
  },

  async listHomeroomAssignments(params: {
    branch?: string
    organization?: string
    academic_year?: string
    section?: string
    teacher?: string
    page?: number
  }): Promise<PaginatedResponse<ApiHomeroomAssignment>> {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v)
    })
    return request<PaginatedResponse<ApiHomeroomAssignment>>(
      `/api/homeroom-assignments/?${q.toString()}`
    )
  },

  async createHomeroomAssignment(
    data: ApiHomeroomAssignmentWrite
  ): Promise<ApiHomeroomAssignment> {
    return request<ApiHomeroomAssignment>("/api/homeroom-assignments/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async deleteHomeroomAssignment(id: string): Promise<void> {
    await request<void>(`/api/homeroom-assignments/${id}/`, {
      method: "DELETE",
    })
  },
}

// ---------------------------------------------------------------------------
// Attendance API
// ---------------------------------------------------------------------------
export const attendanceApi = {
  async list(params: {
    branch?: string
    organization?: string
    section?: string
    student?: string
    academic_year?: string
    date?: string
    status?: AttendanceStatus
    page?: number
  }): Promise<PaginatedResponse<ApiAttendanceRecord>> {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
    })
    return request<PaginatedResponse<ApiAttendanceRecord>>(
      `/api/attendance/?${q.toString()}`
    )
  },

  async dailyStatus(params: {
    branch?: string
    organization?: string
    academic_year?: string
    date?: string
  }): Promise<ApiDailyAttendanceStatus[]> {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v)
    })
    const response = await request<
      ApiDailyAttendanceStatus[] | ApiDailyAttendanceStatusResponse
    >(`/api/attendance/daily-status/?${q.toString()}`)
    if (Array.isArray(response)) return response
    return response.results ?? []
  },

  async summaries(params: {
    organization?: string
    student?: string
    academic_year?: string
  }): Promise<PaginatedResponse<ApiAttendanceSummary>> {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v)
    })
    return request<PaginatedResponse<ApiAttendanceSummary>>(
      `/api/attendance-summaries/?${q.toString()}`
    )
  },

  async bulkSubmit(
    payload: ApiBulkAttendanceSubmit
  ): Promise<ApiBulkAttendanceResult> {
    return request<ApiBulkAttendanceResult>("/api/attendance/bulk-submit/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async bySection(
    sectionId: string,
    date: string
  ): Promise<ApiAttendanceRecord[]> {
    return request<ApiAttendanceRecord[]>(
      `/api/attendance/by-section/?section=${sectionId}&date=${date}`
    )
  },
}

// ---------------------------------------------------------------------------
// Bulk import API
// ---------------------------------------------------------------------------
export const importApi = {
  async getStatus(taskId: string): Promise<ApiImportJob> {
    const response = await request<ApiImportJob | { data: ApiImportJob }>(
      `/api/import-status/${taskId}/`,
      { method: "GET" }
    )
    return unwrapEnvelope(response)
  },

  async startBulkImport(
    endpoint: "students" | "parents" | "teachers",
    mediaFileId: string,
    organizationId: string,
    branchId: string,
    extraData?: Record<string, string>
  ): Promise<{ task_id: string; detail: string }> {
    return request<{ task_id: string; detail: string }>(
      `/api/${endpoint}/bulk-import/`,
      {
        method: "POST",
        body: JSON.stringify({
          file: mediaFileId,
          organization: organizationId,
          branch: branchId,
          ...(extraData ?? {}),
        }),
      }
    )
  },

  async uploadBulkFile(
    endpoint: "students" | "parents" | "teachers",
    file: File,
    organizationId: string,
    branchId: string,
    extraData?: Record<string, string>
  ): Promise<{ task_id: string; detail: string }> {
    const media = await mediaClient.uploadFile({ file })
    return this.startBulkImport(
      endpoint,
      media.id,
      organizationId,
      branchId,
      extraData
    )
  },
}

// ---------------------------------------------------------------------------
// Announcements API
// ---------------------------------------------------------------------------
export const announcementsApi = {
  async list(params: {
    branch?: string
    organization?: string
    status?: AnnouncementStatus
    target_roles?: AnnouncementTargetRole
    is_urgent?: boolean
    search?: string
    page?: number
    ordering?: string
  }): Promise<PaginatedResponse<ApiAnnouncement>> {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
    })
    return request<PaginatedResponse<ApiAnnouncement>>(
      `/api/announcements/?${q.toString()}`
    )
  },

  async get(id: string): Promise<ApiAnnouncement> {
    return request<ApiAnnouncement>(`/api/announcements/${id}/`)
  },

  async create(data: ApiAnnouncementWrite): Promise<ApiAnnouncement> {
    return request<ApiAnnouncement>("/api/announcements/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async update(
    id: string,
    data: Partial<ApiAnnouncementWrite>
  ): Promise<ApiAnnouncement> {
    return request<ApiAnnouncement>(`/api/announcements/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

  async delete(id: string): Promise<void> {
    await request<void>(`/api/announcements/${id}/`, { method: "DELETE" })
  },

  async getTargetingCriteria(): Promise<ApiAnnouncementTargetingCriteria> {
    return request<ApiAnnouncementTargetingCriteria>(
      "/api/announcements/get_targeting_criteria/",
      { method: "GET" }
    )
  },
}

export const calendarApi = {
  async listEvents(params: {
    branch?: string
    organization?: string
    academic_year?: string
  }): Promise<ApiCalendarEvent[]> {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
    })

    const payload = unwrapEnvelope(
      await request<PaginatedResponse<ApiCalendarEvent> | ApiCalendarEvent[]>(
        `/api/calendar-events/?${q.toString()}`
      )
    )

    return Array.isArray(payload) ? payload : payload.results ?? []
  },

  async createEvent(data: ApiCalendarEventWrite): Promise<ApiCalendarEvent> {
    return request<ApiCalendarEvent>("/api/calendar-events/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async updateEvent(
    id: string,
    data: Partial<ApiCalendarEventWrite>
  ): Promise<ApiCalendarEvent> {
    return request<ApiCalendarEvent>(`/api/calendar-events/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

  async deleteEvent(id: string): Promise<void> {
    await request<void>(`/api/calendar-events/${id}/`, { method: "DELETE" })
  },

  async importEvents(
    file: File,
    organizationId: string,
    branchId: string,
    academicYearId?: string | null
  ): Promise<{ task_id: string; detail: string }> {
    const media = await mediaClient.uploadFile({ file })

    return request<{ task_id: string; detail: string }>(
      "/api/calendar-events/bulk-import/",
      {
        method: "POST",
        body: JSON.stringify({
          file: media.id,
          organization: organizationId,
          branch: branchId,
          ...(academicYearId ? { academic_year: academicYearId } : {}),
        }),
      }
    )
  },

  async getActiveDocument(
    branchId: string,
    organizationId: string,
    academicYearId?: string | null
  ): Promise<ApiCalendarDocument | null> {
    const q = new URLSearchParams({
      branch: branchId,
      organization: organizationId,
    })

    if (academicYearId) {
      q.set("academic_year", academicYearId)
    }

    try {
      return unwrapEnvelope(
        await request<ApiCalendarDocument | { data?: ApiCalendarDocument }>(
          `/api/calendar-documents/current/?${q.toString()}`
        )
      )
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null
      }
      throw error
    }
  },

  async setActiveDocument(data: {
    file: File
    branchId: string
    organizationId: string
    academicYearId?: string | null
  }): Promise<ApiCalendarDocument> {
    const media = await mediaClient.uploadFile({ file: data.file })

    return request<ApiCalendarDocument>("/api/calendar-documents/current/", {
      method: "POST",
      body: JSON.stringify({
        media_file: media.id,
        branch: data.branchId,
        organization: data.organizationId,
        ...(data.academicYearId ? { academic_year: data.academicYearId } : {}),
      }),
    })
  },
}

// ---------------------------------------------------------------------------
// Backward-compat aliases so Academia.tsx keeps working without changes
// ---------------------------------------------------------------------------
/** @deprecated Use ApiGrade */
export type Grade = ApiGrade
/** @deprecated Use ApiSection */
export type Section = ApiSection
/** @deprecated Use ApiSubject */
export type Subject = ApiSubject
