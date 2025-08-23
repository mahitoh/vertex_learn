export interface DashboardStats {
  totalStudents: number;
  totalEmployees: number;
  totalSubjects: number;
  totalHolidays: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'holiday' | 'exam' | 'event';
  color?: string;
  description?: string;
}

export interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  D?: number;
  F?: number;
}

export interface StudentDashboardData {
  totalCourses: number;
  attendancePercentage: number;
  upcomingExams: number;
  grades: { [key: string]: number };
  calendarEvents: { date: string; event: string }[];
}
