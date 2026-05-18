
export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  photoUrl?: string;
  registrationStatus: 'Registered' | 'Pending' | 'Withdrawn';
  languagePreference: 'English' | 'Amharic';
  parentId?: string;
}

export interface Parent {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'Active' | 'Invited' | 'Pending Linkage';
  linkedStudents: string[]; // Reference to Student IDs
  languagePreference: 'English' | 'Amharic';
  relationship?: 'Father' | 'Mother' | 'Guardian';
  isPrimaryContact: boolean;
  photoUrl?: string;
}

export interface Grade {
  id: string;
  name: string; // e.g., "Grade 9"
}

export interface Section {
  id: string;
  gradeId: string;
  name: string; // e.g., "A"
  homeroomTeacherId?: string;
  studentCount: number;
}

export interface Subject {
  id: string;
  nameEn: string;
  nameAm: string;
  code: string;
  applicableGrades: string[]; // e.g., ["Grade 9", "Grade 10"]
}

export interface Assignment {
  id: string;
  teacherId: string;
  sectionId: string;
  subjectId: string;
  isHomeroom: boolean;
  academicYear: string;
}

export type ModuleId = 'dashboard' | 'parents' | 'students' | 'teachers' | 'academia' | 'attendance' | 'calendar' | 'announcements' | 'batchImport';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'Active' | 'Invited' | 'On Leave' | 'Inactive';
  employeeId: string;
  subjects: string[];
  assignedSections: string[];
  bioEn: string;
  bioAm: string;
  totalAlerts: number;
  parentAnnouncements: number;
  joiningDate: string;
  photoUrl?: string;
}

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
