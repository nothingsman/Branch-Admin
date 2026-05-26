/**
 * UI-layer domain types.
 *
 * These are the shapes that components work with after mapping from the raw
 * API responses.  Keep field names stable here — components depend on them.
 * API-side types live in src/lib/api.ts.
 */

// ---------------------------------------------------------------------------
// Student
// ---------------------------------------------------------------------------
export type RegistrationStatus = 'Registered' | 'Pending' | 'Withdrawn' | 'Graduated';
export type LanguagePreference = 'English' | 'Amharic';

export interface Student {
  id: string;
  /** Full display name (first_name + last_name from API) */
  name: string;
  firstName: string;
  lastName: string;
  grade: string;       // grade_name from API
  gradeId: string;     // grade_id from API
  section: string;     // section_name from API
  sectionId: string;   // current_section UUID from API
  rollNo: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string;
  admissionDate: string;
  photoUrl?: string | null;
  registrationStatus: RegistrationStatus;
  languagePreference: LanguagePreference;
  /** UUID of the linked parent (resolved from parent-links) */
  parentId?: string;
  academicYearId?: string;
  branchId: string;
  organizationId: string;
}

// ---------------------------------------------------------------------------
// Parent
// ---------------------------------------------------------------------------
export type ParentStatus = 'Active' | 'Pending' | 'Unlinked';

export interface Parent {
  id: string;
  name: string;       // user_details.name from API
  fatherName?: string;
  grandfatherName?: string;
  phone: string;      // user_details.phone_number from API
  email: string;      // user_details.email from API
  status: ParentStatus;
  /** UUIDs of linked students (from student_details) */
  linkedStudents: string[];
  linkedStudentCount?: number;
  linkedGrades?: string[];
  languagePreference: LanguagePreference;
  relationship?: 'Father' | 'Mother' | 'Guardian';
  isPrimaryContact: boolean;
  photoUrl?: string;
  isActive: boolean;
  isInviteEligible?: boolean;
  occupation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

// ---------------------------------------------------------------------------
// Grade / Section / Subject  (UI shapes — simpler than API shapes)
// ---------------------------------------------------------------------------
export interface Grade {
  id: string;
  name: string;
}

export interface Section {
  id: string;
  gradeId: string;
  name: string;
  homeroomTeacherId?: string;
  studentCount: number;
}

export interface Subject {
  id: string;
  nameEn: string;
  nameAm: string;
  code: string;
  applicableGrades: string[];
}

export interface Assignment {
  id: string;
  teacherId: string;
  sectionId: string;
  subjectId: string;
  isHomeroom: boolean;
  academicYear: string;
}

// ---------------------------------------------------------------------------
// Teacher
// ---------------------------------------------------------------------------
export type TeacherStatus = 'Active' | 'Invited' | 'On Leave' | 'Inactive';

export interface Teacher {
  id: string;
  name: string;         // user_name from API
  email: string;        // user_email from API
  phone?: string;
  status: TeacherStatus;
  employeeId: string;   // employee_id from API
  subjects: string[];   // derived from assignments
  assignedSections: string[];  // derived from assignments
  bioEn: string;        // bio from API
  bioAm: string;
  totalAlerts: number;
  parentAnnouncements: number;
  joiningDate: string;  // joining_date from API
  photoUrl?: string;
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
export type ModuleId =
  | 'dashboard'
  | 'parents'
  | 'students'
  | 'teachers'
  | 'academia'
  | 'attendance'
  | 'calendar'
  | 'announcements'
  | 'batchImport';

// ---------------------------------------------------------------------------
// Dashboard widgets
// ---------------------------------------------------------------------------
export interface MetricCardData {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
}

export interface ApprovalRequest {
  id: string;
  type: string;
  submittedBy: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
