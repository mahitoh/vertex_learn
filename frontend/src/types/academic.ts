export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  instructor: string;
  instructorId: string;
  description: string;
  semester: string;
  year: number;
  maxStudents: number;
  enrolledStudents: number;
  schedule: {
    day: string;
    time: string;
    room: string;
  }[];
  status: 'active' | 'inactive' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  program: string;
  year: number;
  semester: number;
  gpa: number;
  totalCredits: number;
  status: 'active' | 'inactive' | 'graduated';
  enrolledCourses: string[];
  avatar?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  studentName: string;
  assessmentType: 'quiz' | 'assignment' | 'midterm' | 'final' | 'project' | 'participation';
  assessmentName: string;
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  gradePoints: number;
  weight: number;
  submittedAt?: string;
  gradedAt: string;
  feedback?: string;
  semester: string;
  year: number;
}

export interface Attendance {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  markedBy: string;
  markedAt: string;
}

export interface Exam {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  type: 'quiz' | 'midterm' | 'final' | 'practical';
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  room: string;
  instructor: string;
  instructorId: string;
  maxScore: number;
  instructions?: string;
  materials?: string[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  enrolledStudents: string[];
  results?: {
    studentId: string;
    score: number;
    submitted: boolean;
    submittedAt?: string;
  }[];
}

export interface AcademicReport {
  id: string;
  type: 'transcript' | 'attendance' | 'grade_summary' | 'course_report';
  studentId?: string;
  courseId?: string;
  semester: string;
  year: number;
  generatedAt: string;
  generatedBy: string;
  data: any;
  format: 'pdf' | 'excel' | 'json';
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  status: 'enrolled' | 'dropped' | 'completed';
  finalGrade?: string;
  finalScore?: number;
  credits: number;
}

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'exam' | 'assignment_due' | 'holiday' | 'registration' | 'graduation' | 'orientation';
  courseId?: string;
  courseName?: string;
  priority: 'low' | 'medium' | 'high';
  color: string;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
}

export interface CourseStatistics {
  courseId: string;
  courseName: string;
  totalStudents: number;
  averageGrade: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  attendanceRate: number;
  completionRate: number;
  dropoutRate: number;
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  currentGPA: number;
  totalCredits: number;
  completedCourses: number;
  currentCourses: number;
  attendanceRate: number;
  gradeHistory: {
    semester: string;
    year: number;
    gpa: number;
    credits: number;
    courses: {
      courseId: string;
      courseName: string;
      grade: string;
      credits: number;
    }[];
  }[];
  performanceTrend: 'improving' | 'declining' | 'stable';
}