
import { Grade, Section, Subject, Teacher, Assignment, Student, Parent } from '../types';

function createStudent(
  partial: Pick<
    Student,
    'id' | 'name' | 'grade' | 'section' | 'registrationStatus' | 'languagePreference'
  > &
    Partial<Student>,
): Student {
  const [firstName = partial.name, lastName = ''] = partial.name.split(' ');
  return {
    firstName,
    lastName,
    gradeId: partial.gradeId ?? partial.grade.toLowerCase().replace(/\s+/g, '-'),
    sectionId: partial.sectionId ?? `${partial.grade}-${partial.section}`.toLowerCase(),
    rollNo: partial.rollNo ?? partial.id.toUpperCase(),
    gender: partial.gender ?? 'OTHER',
    dateOfBirth: partial.dateOfBirth ?? '2008-01-01',
    admissionDate: partial.admissionDate ?? '2024-09-01',
    branchId: partial.branchId ?? 'mock-branch',
    organizationId: partial.organizationId ?? 'mock-org',
    ...partial,
  };
}

export const mockParents: Parent[] = [
  { 
    id: 'p1', 
    name: 'Teshome G. Michael', 
    phone: '+251 911 223344', 
    email: 'teshome.gm@example.com', 
    status: 'Active', 
    linkedStudents: ['st1', 'st2'], 
    languagePreference: 'English',
    relationship: 'Father',
    isPrimaryContact: true,
    isActive: true,
  },
  { 
    id: 'p2', 
    name: 'Kebede Ayele', 
    phone: '+251 911 556677', 
    email: 'k.ayele@school.edu', 
    status: 'Pending', 
    linkedStudents: ['st3'], 
    languagePreference: 'Amharic',
    relationship: 'Father',
    isPrimaryContact: true,
    isActive: false,
  },
  { 
    id: 'p3', 
    name: 'Almaz Tadesse', 
    phone: '+251 922 889900', 
    email: 'almaz.t@mail.com', 
    status: 'Unlinked', 
    linkedStudents: [], 
    languagePreference: 'Amharic',
    isPrimaryContact: false,
    relationship: 'Mother',
    isActive: false,
  },
];

export const mockStudents: Student[] = [
  createStudent({ id: 'st1', name: 'Nahom Tesfaye', grade: 'Grade 9', section: 'A', registrationStatus: 'Registered', languagePreference: 'English', parentId: 'p1' }),
  createStudent({ id: 'st2', name: 'Betty Girma', grade: 'Grade 9', section: 'A', registrationStatus: 'Registered', languagePreference: 'Amharic', parentId: 'p1' }),
  createStudent({ id: 'st3', name: 'Yonas mamo', grade: 'Grade 10', section: 'A', registrationStatus: 'Registered', languagePreference: 'English', parentId: 'p2' }),
  createStudent({ id: 'st4', name: 'Selam Habte', grade: 'Grade 11', section: 'A', registrationStatus: 'Registered', languagePreference: 'Amharic', parentId: 'p3' }),
  createStudent({ id: 'st5', name: 'Kebede Alemu', grade: 'Grade 9', section: 'B', registrationStatus: 'Pending', languagePreference: 'Amharic' }),
  createStudent({ id: 'st6', name: 'Marta Hailu', grade: 'Grade 10', section: 'B', registrationStatus: 'Registered', languagePreference: 'English' }),
  createStudent({ id: 'st7', name: 'Daniel Tadesse', grade: 'Grade 12', section: 'A', registrationStatus: 'Registered', languagePreference: 'English' }),
  createStudent({ id: 'st8', name: 'Helen Gashaw', grade: 'Grade 9', section: 'A', registrationStatus: 'Withdrawn', languagePreference: 'Amharic' }),
];

export const mockGrades: Grade[] = [
  { id: 'g9', name: 'Grade 9' },
  { id: 'g10', name: 'Grade 10' },
  { id: 'g11', name: 'Grade 11' },
  { id: 'g12', name: 'Grade 12' },
];

export const mockSections: Section[] = [
  { id: '9a', gradeId: 'g9', name: 'A', homeroomTeacherId: '1', studentCount: 45 },
  { id: '9b', gradeId: 'g9', name: 'B', studentCount: 42 },
  { id: '10a', gradeId: 'g10', name: 'A', homeroomTeacherId: '2', studentCount: 38 },
  { id: '11a', gradeId: 'g11', name: 'A', homeroomTeacherId: '3', studentCount: 40 },
  { id: '12a', gradeId: 'g12', name: 'A', studentCount: 35 },
];

export const mockSubjects: Subject[] = [
  { id: 's1', nameEn: 'Mathematics', nameAm: 'ሒሳብ', code: 'MATH', applicableGrades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
  { id: 's2', nameEn: 'Biology', nameAm: 'ባዮሎጂ', code: 'BIOL', applicableGrades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
  { id: 's3', nameEn: 'Chemistry', nameAm: 'ኬሚስትሪ', code: 'CHEM', applicableGrades: ['Grade 11', 'Grade 12'] },
  { id: 's4', nameEn: 'Amharic', nameAm: 'አማርኛ', code: 'AMH', applicableGrades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
  { id: 's5', nameEn: 'Civics', nameAm: 'ግርማዊነት', code: 'CIVI', applicableGrades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
];

export const mockTeachers: Teacher[] = [
  { 
    id: '1', name: 'Abebe Kebede', email: 'abebe@school.edu', status: 'Active', 
    employeeId: 'FAC001', subjects: ['Mathematics'], assignedSections: ['9A', '10B'],
    bioEn: 'Senior Math specialist.', bioAm: 'የሒሳብ መምህር።',
    totalAlerts: 2, parentAnnouncements: 15, joiningDate: '2020-09-12'
  },
  { 
    id: '2', name: 'Sara Tesfaye', email: 'sara@school.edu', status: 'Active', 
    employeeId: 'FAC002', subjects: ['Science'], assignedSections: ['10A'],
    bioEn: 'Science teacher.', bioAm: 'የሳይንስ መምህርት።',
    totalAlerts: 0, parentAnnouncements: 8, joiningDate: '2021-01-15'
  },
  { 
    id: '3', name: 'Samuel Desta', email: 'samuel@school.edu', status: 'Active', 
    employeeId: 'FAC003', subjects: ['History'], assignedSections: ['11A'],
    bioEn: 'History teacher.', bioAm: 'የታሪክ መምህር።',
    totalAlerts: 5, parentAnnouncements: 20, joiningDate: '2019-08-20'
  },
  { 
    id: '4', name: 'Tigist Belay', email: 'tigist@school.edu', status: 'Active', 
    employeeId: 'FAC004', subjects: ['English'], assignedSections: [],
    bioEn: 'English teacher.', bioAm: 'የእንግሊዝኛ መምህርት።',
    totalAlerts: 1, parentAnnouncements: 5, joiningDate: '2022-03-10'
  },
  { 
    id: '5', name: 'Dawit Mekonnen', email: 'dawit@school.edu', status: 'Active', 
    employeeId: 'FAC005', subjects: ['Arts'], assignedSections: [],
    bioEn: 'Arts teacher.', bioAm: 'የስዕል መምህር።',
    totalAlerts: 0, parentAnnouncements: 2, joiningDate: '2023-01-01'
  }
];

export const mockAssignments: Assignment[] = [
  { id: 'a1', teacherId: '1', sectionId: '9a', subjectId: 's1', isHomeroom: true, academicYear: 'AY 2024-25' },
  { id: 'a2', teacherId: '2', sectionId: '10a', subjectId: 's2', isHomeroom: true, academicYear: 'AY 2024-25' },
  { id: 'a3', teacherId: '3', sectionId: '11a', subjectId: 's1', isHomeroom: true, academicYear: 'AY 2024-25' },
];
