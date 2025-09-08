import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/dashboard/Header";
import SlidingSidebar from "@/components/dashboard/SlidingSidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import AcademicCalendar from "@/components/dashboard/AcademicCalendar";
import ActionButtons from "@/components/dashboard/ActionButtons";
import InteractiveChart from "@/components/charts/InteractiveChart";
import GradeManagement from "@/components/teacher/GradeManagement";
import ExamCalendar from "@/components/teacher/ExamCalendar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/UserContext";
import { useSidebar } from "@/contexts/SidebarContext";
import type {
  DashboardStats,
  CalendarEvent,
  GradeDistribution,
} from "@/types/dashboard";
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  UserCheck,
  Clock,
  FileText,
  Award,
  CheckCircle,
  AlertCircle,
  Bell,
  BookMarked,
  Calculator,
  PenTool,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define interfaces for type safety
interface Assignment {
  id?: number;
  title: string;
  course: string;
  dueDate?: string;
  due?: string;
  status: string;
  description?: string;
  type?: string;
  progress?: number;
  points?: number;
  class?: string;
  pending?: number;
  assignment?: string;
  priority?: string;
  grade?: string;
  score?: string;
  date?: string;
  feedback?: string;
  submissions?: number;
  submitted?: string;
}

interface Grade {
  id?: number;
  course: string;
  assignment: string;
  grade: string;
  percentage?: number;
  feedback?: string;
  submittedDate?: string;
  score?: string;
  date?: string;
}

interface ClassInfo {
  id?: number;
  name?: string;
  subject?: string;
  students: number;
  time?: string;
  room?: string;
  description?: string;
  class?: string;
  average?: string;
  nextClass?: string;
  attendance?: string;
}

export default function AcademicDashboard() {
  const isMobile = useIsMobile();
  const { user, isStudent, isTeacher, isLoading: userLoading } = useUser();
  const {
    sidebarOpen,
    sidebarCollapsed,
    setSidebarOpen,
    toggleSidebar,
    toggleCollapse,
  } = useSidebar();

  // State for interactive features
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [showGradeModal, setShowGradeModal] = useState<boolean>(false);
  const [assignments] = useState([
    {
      id: 1,
      title: "Mathematics Calculus Problem Set",
      course: "Mathematics",
      due: "Tomorrow",
      status: "pending",
      priority: "high",
      description: "Complete problems 1-20 from Chapter 5",
    },
    {
      id: 2,
      title: "Physics Lab Report",
      course: "Physics",
      due: "Oct 15",
      status: "in-progress",
      priority: "medium",
      description: "Analyze the pendulum experiment results",
    },
    {
      id: 3,
      title: "English Literature Essay",
      course: "English",
      due: "Oct 18",
      status: "not-started",
      priority: "low",
      description: "Write a 1500-word essay on Shakespeare's Hamlet",
    },
    {
      id: 4,
      title: "Chemistry Quiz",
      course: "Chemistry",
      due: "Oct 20",
      status: "not-started",
      priority: "medium",
      description: "Covers organic chemistry basics",
    },
  ]);
  const [grades] = useState([
    {
      id: 1,
      course: "Mathematics",
      assignment: "Midterm Exam",
      grade: "A-",
      score: "87/100",
      date: "Oct 5",
      feedback: "Excellent work on derivatives, review integration techniques",
    },
    {
      id: 2,
      course: "Physics",
      assignment: "Lab Report #3",
      grade: "B+",
      score: "88/100",
      date: "Oct 3",
      feedback: "Good analysis, improve error calculations",
    },
    {
      id: 3,
      course: "Chemistry",
      assignment: "Quiz #4",
      grade: "A",
      score: "95/100",
      date: "Oct 1",
      feedback: "Perfect understanding of concepts",
    },
    {
      id: 4,
      course: "English",
      assignment: "Essay Analysis",
      grade: "B",
      score: "82/100",
      date: "Sep 28",
      feedback: "Good structure, strengthen thesis statement",
    },
  ]);

  // Handler functions
  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleViewGrade = (grade: Grade) => {
    setSelectedGrade(grade);
    setShowGradeModal(true);
  };

  const handleViewClass = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo);
    setCurrentView("class-details");
  };

  const handleNavigateToView = (view: string) => {
    setCurrentView(view);
  };

  const handleJoinClass = (classInfo: string) => {
    alert(`Joining class: ${classInfo}`);
  };

  const handleTakeAttendance = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo);
    setCurrentView("attendance");
  };

  const handleGradeNow = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setCurrentView("grading");
  };

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: events, isLoading: eventsLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/events"],
  });

  const { data: gradeDistribution, isLoading: gradesLoading } =
    useQuery<GradeDistribution>({
      queryKey: ["/api/grades/distribution"],
    });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-content-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-content-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Please log in to access the academic dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Enhanced Student-specific stats with more relevant data
  const studentStatsCards = [
    {
      icon: GraduationCap,
      value: "3.7",
      label: "Current GPA",
      color: "bg-blue-100 text-blue-600",
      testId: "stat-current-gpa",
      trend: "+0.2",
    },
    {
      icon: UserCheck,
      value: 92,
      label: "Attendance Rate",
      color: "bg-green-100 text-green-600",
      testId: "stat-attendance-rate",
      trend: "+3%",
    },
    {
      icon: FileText,
      value: 4,
      label: "Pending Assignments",
      color: "bg-orange-100 text-orange-600",
      testId: "stat-pending-assignments",
      urgent: true,
    },
    {
      icon: Calendar,
      value: 2,
      label: "Upcoming Exams",
      color: "bg-red-100 text-red-600",
      testId: "stat-upcoming-exams",
      urgent: true,
    },
  ];

  // Enhanced Teacher-specific stats
  const teacherStatsCards = [
    {
      icon: Users,
      value: stats?.totalStudents || 120,
      label: "Total Students",
      color: "bg-blue-100 text-blue-600",
      testId: "stat-total-students",
    },
    {
      icon: BookOpen,
      value: 5,
      label: "Active Courses",
      color: "bg-green-100 text-green-600",
      testId: "stat-courses-teaching",
    },
    {
      icon: PenTool,
      value: 23,
      label: "Pending Grades",
      color: "bg-yellow-100 text-yellow-600",
      testId: "stat-pending-grades",
      urgent: true,
    },
    {
      icon: Target,
      value: "87%",
      label: "Class Average",
      color: "bg-purple-100 text-purple-600",
      testId: "stat-class-average",
      trend: "+2%",
    },
  ];

  const statsCards = isStudent ? studentStatsCards : teacherStatsCards;

  // Student grade data for charts
  const studentGradeData = {
    labels: ["Mathematics", "Physics", "Chemistry", "Biology", "English"],
    datasets: [
      {
        label: "Current Grades",
        data: [85, 78, 92, 88, 90],
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
        ],
        borderColor: ["#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED"],
        borderWidth: 2,
      },
    ],
  };

  // Teacher class performance data
  const classPerformanceData = {
    labels: ["Grade 12-A", "Grade 12-B", "Grade 11-A", "Grade 11-B"],
    datasets: [
      {
        label: "Average Score",
        data: [85, 78, 82, 75],
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
        borderColor: ["#2563EB", "#059669", "#D97706", "#DC2626"],
        borderWidth: 2,
      },
    ],
  };

  // Calculate main content margin based on sidebar state
  const getMainMargin = () => {
    if (isMobile) return "";
    return sidebarCollapsed ? "ml-16" : "ml-64";
  };

  return (
    <div className="min-h-screen bg-content-bg">
      <Header
        onMenuToggle={toggleSidebar}
        isMobile={isMobile}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleCollapse}
        sidebarWidth={sidebarCollapsed ? 64 : 256}
      />

      <div className="flex pt-16">
        <SlidingSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        <main
          className={`flex-1 p-3 sm:p-4 lg:p-6 transition-all duration-300 ${getMainMargin()}`}
        >
          {/* Welcome Section */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-sm sm:text-base text-text-secondary">
              {isStudent
                ? "Track your academic progress and stay updated with your courses."
                : isTeacher
                ? "Manage your classes, track student progress, and schedule exams."
                : "Manage the academic system and monitor overall performance."}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            {statsCards.map((stat, index) => (
              <StatsCard
                key={index}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                color={stat.color}
                isLoading={statsLoading}
                data-testid={stat.testId}
              />
            ))}
          </div>

          {/* Role-specific Dashboard Layout */}
          {isStudent ? (
            <div className="space-y-6">
              {/* Enhanced Student Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                  className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleNavigateToView("courses")}
                >
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-8 w-8" />
                    <div>
                      <h3 className="font-semibold">My Courses</h3>
                      <p className="text-sm opacity-90">
                        View all enrolled courses
                      </p>
                    </div>
                  </div>
                </Card>
                <Card
                  className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleNavigateToView("assignments")}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8" />
                    <div>
                      <h3 className="font-semibold">Assignments</h3>
                      <p className="text-sm opacity-90">
                        Submit and track assignments
                      </p>
                    </div>
                  </div>
                </Card>
                <Card
                  className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleNavigateToView("grades")}
                >
                  <div className="flex items-center space-x-3">
                    <Award className="h-8 w-8" />
                    <div>
                      <h3 className="font-semibold">Grades</h3>
                      <p className="text-sm opacity-90">
                        View academic performance
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Upcoming Assignments */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Upcoming Assignments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            title: "Mathematics Calculus Problem Set",
                            course: "Mathematics",
                            due: "Tomorrow",
                            status: "pending",
                            priority: "high",
                          },
                          {
                            title: "Physics Lab Report",
                            course: "Physics",
                            due: "Oct 15",
                            status: "in-progress",
                            priority: "medium",
                          },
                          {
                            title: "English Literature Essay",
                            course: "English",
                            due: "Oct 18",
                            status: "not-started",
                            priority: "low",
                          },
                          {
                            title: "Chemistry Quiz",
                            course: "Chemistry",
                            due: "Oct 20",
                            status: "not-started",
                            priority: "medium",
                          },
                        ].map((assignment, index) => {
                          const fullAssignment =
                            assignments[index] || assignment;
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm">
                                    {assignment.title}
                                  </h4>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                      assignment.priority === "high"
                                        ? "bg-red-100 text-red-700"
                                        : assignment.priority === "medium"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {assignment.priority}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {assignment.course} • Due {assignment.due}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    assignment.status === "pending"
                                      ? "bg-orange-100 text-orange-700"
                                      : assignment.status === "in-progress"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {assignment.status.replace("-", " ")}
                                </span>
                                <button
                                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                  onClick={() =>
                                    handleViewAssignment(fullAssignment)
                                  }
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Grades */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Recent Grades
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            course: "Mathematics",
                            assignment: "Midterm Exam",
                            grade: "A-",
                            score: "87/100",
                            date: "Oct 5",
                          },
                          {
                            course: "Physics",
                            assignment: "Lab Report #3",
                            grade: "B+",
                            score: "88/100",
                            date: "Oct 3",
                          },
                          {
                            course: "Chemistry",
                            assignment: "Quiz #4",
                            grade: "A",
                            score: "95/100",
                            date: "Oct 1",
                          },
                          {
                            course: "English",
                            assignment: "Essay Analysis",
                            grade: "B",
                            score: "82/100",
                            date: "Sep 28",
                          },
                        ].map((grade, index) => {
                          const fullGrade = grades[index] || grade;
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                            >
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">
                                  {grade.assignment}
                                </h4>
                                <p className="text-xs text-gray-600">
                                  {grade.course} • {grade.date}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div
                                    className={`text-lg font-bold ${
                                      grade.grade.startsWith("A")
                                        ? "text-green-600"
                                        : grade.grade.startsWith("B")
                                        ? "text-blue-600"
                                        : "text-orange-600"
                                    }`}
                                  >
                                    {grade.grade}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {grade.score}
                                  </p>
                                </div>
                                <button
                                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                  onClick={() => handleViewGrade(fullGrade)}
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Academic Calendar */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        This Week
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            day: "Today",
                            events: [
                              "Math Quiz at 10:00 AM",
                              "Physics Lab at 2:00 PM",
                            ],
                          },
                          {
                            day: "Tomorrow",
                            events: [
                              "Chemistry Lecture at 9:00 AM",
                              "Assignment Due: English Essay",
                            ],
                          },
                          {
                            day: "Wednesday",
                            events: ["Group Project Meeting at 3:00 PM"],
                          },
                          { day: "Friday", events: ["Midterm Exam: Physics"] },
                        ].map((day, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-blue-500 pl-3"
                          >
                            <h4 className="font-medium text-sm text-gray-900">
                              {day.day}
                            </h4>
                            {day.events.map((event, eventIndex) => (
                              <p
                                key={eventIndex}
                                className="text-xs text-gray-600 mt-1"
                              >
                                {event}
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Progress Overview */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Course Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { course: "Mathematics", progress: 85, grade: "A-" },
                          { course: "Physics", progress: 78, grade: "B+" },
                          { course: "Chemistry", progress: 92, grade: "A" },
                          { course: "English", progress: 82, grade: "B+" },
                        ].map((course, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                {course.course}
                              </span>
                              <span className="text-sm text-gray-600">
                                {course.grade}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {course.progress}% Complete
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Notifications */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            type: "assignment",
                            message: "New assignment posted in Mathematics",
                            time: "2h ago",
                            urgent: true,
                          },
                          {
                            type: "grade",
                            message: "Grade posted for Physics Lab Report",
                            time: "1d ago",
                            urgent: false,
                          },
                          {
                            type: "announcement",
                            message: "Class cancelled for Chemistry tomorrow",
                            time: "2d ago",
                            urgent: false,
                          },
                        ].map((notification, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded-lg border-l-4 ${
                              notification.urgent
                                ? "border-red-500 bg-red-50"
                                : "border-blue-500 bg-blue-50"
                            }`}
                          >
                            <p className="text-sm font-medium">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : isTeacher ? (
            <div className="space-y-6">
              {/* Enhanced Teacher Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card
                  className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleNavigateToView("classes")}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8" />
                    <div>
                      <h3 className="font-semibold">My Classes</h3>
                      <p className="text-sm opacity-90">Manage all classes</p>
                    </div>
                  </div>
                </Card>
                <Card
                  className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleNavigateToView("gradebook")}
                >
                  <div className="flex items-center space-x-3">
                    <PenTool className="h-8 w-8" />
                    <div>
                      <h3 className="font-semibold">Grade Book</h3>
                      <p className="text-sm opacity-90">Grade assignments</p>
                    </div>
                  </div>
                </Card>
                <Card
                  className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleNavigateToView("schedule")}
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-8 w-8" />
                    <div>
                      <h3 className="font-semibold">Schedule</h3>
                      <p className="text-sm opacity-90">View class schedule</p>
                    </div>
                  </div>
                </Card>
                <Card
                  className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleNavigateToView("resources")}
                >
                  <div className="flex items-center space-x-3">
                    <BookMarked className="h-8 w-8" />
                    <div>
                      <h3 className="font-semibold">Resources</h3>
                      <p className="text-sm opacity-90">Course materials</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Class Management */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        My Classes
                        <select
                          className="ml-auto text-sm border border-gray-300 rounded px-2 py-1"
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                          <option value="all">All Classes</option>
                          <option value="math-12a">Math 12-A</option>
                          <option value="math-12b">Math 12-B</option>
                          <option value="math-11a">Math 11-A</option>
                        </select>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            class: "Mathematics 12-A",
                            students: 28,
                            average: "87%",
                            nextClass: "Today 10:00 AM",
                            attendance: "92%",
                          },
                          {
                            class: "Mathematics 12-B",
                            students: 25,
                            average: "82%",
                            nextClass: "Today 2:00 PM",
                            attendance: "88%",
                          },
                          {
                            class: "Mathematics 11-A",
                            students: 30,
                            average: "85%",
                            nextClass: "Tomorrow 9:00 AM",
                            attendance: "95%",
                          },
                          {
                            class: "Mathematics 11-B",
                            students: 27,
                            average: "79%",
                            nextClass: "Tomorrow 11:00 AM",
                            attendance: "90%",
                          },
                        ].map((classInfo, index) => (
                          <Card
                            key={index}
                            className="border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-lg mb-3">
                                {classInfo.class}
                              </h4>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">
                                    Students:
                                  </span>
                                  <span className="font-medium">
                                    {classInfo.students}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">
                                    Class Average:
                                  </span>
                                  <span className="font-medium text-green-600">
                                    {classInfo.average}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">
                                    Attendance:
                                  </span>
                                  <span className="font-medium text-blue-600">
                                    {classInfo.attendance}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">
                                    Next Class:
                                  </span>
                                  <span className="font-medium">
                                    {classInfo.nextClass}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-4 flex gap-2">
                                <button
                                  className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                  onClick={() => handleViewClass(classInfo)}
                                >
                                  View Details
                                </button>
                                <button
                                  className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                                  onClick={() =>
                                    handleTakeAttendance(classInfo)
                                  }
                                >
                                  Take Attendance
                                </button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pending Grades */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <PenTool className="h-5 w-5" />
                        Pending Grades
                        <span className="ml-auto text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          23 items
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            assignment: "Calculus Midterm Exam",
                            class: "Math 12-A",
                            submissions: 28,
                            pending: 5,
                            submitted: "2 days ago",
                          },
                          {
                            assignment: "Trigonometry Quiz",
                            class: "Math 12-B",
                            submissions: 25,
                            pending: 8,
                            submitted: "1 day ago",
                          },
                          {
                            assignment: "Algebra Problem Set",
                            class: "Math 11-A",
                            submissions: 30,
                            pending: 10,
                            submitted: "3 hours ago",
                          },
                          {
                            assignment: "Geometry Lab Report",
                            class: "Math 11-B",
                            submissions: 27,
                            pending: 0,
                            submitted: "1 week ago",
                          },
                        ].map((assignment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {assignment.assignment}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {assignment.class} • Submitted{" "}
                                {assignment.submitted}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-gray-500">
                                  {assignment.submissions - assignment.pending}/
                                  {assignment.submissions} graded
                                </span>
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        ((assignment.submissions -
                                          assignment.pending) /
                                          assignment.submissions) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {assignment.pending > 0 && (
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                                  {assignment.pending} pending
                                </span>
                              )}
                              <button
                                className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                onClick={() => {
                                  const fullAssignment: Assignment = {
                                    title: assignment.assignment,
                                    course: assignment.class,
                                    status:
                                      assignment.pending > 0
                                        ? "pending"
                                        : "completed",
                                    pending: assignment.pending,
                                    assignment: assignment.assignment,
                                    class: assignment.class,
                                    submissions: assignment.submissions,
                                    submitted: assignment.submitted,
                                  };
                                  if (fullAssignment.pending > 0) {
                                    handleGradeNow(fullAssignment);
                                  } else {
                                    alert("Review completed assignments");
                                  }
                                }}
                              >
                                {assignment.pending > 0
                                  ? "Grade Now"
                                  : "Review"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Today's Schedule */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Today's Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            time: "09:00 AM",
                            class: "Math 11-A",
                            room: "Room 101",
                            duration: "50 min",
                            status: "upcoming",
                          },
                          {
                            time: "10:00 AM",
                            class: "Math 12-A",
                            room: "Room 102",
                            duration: "50 min",
                            status: "current",
                          },
                          {
                            time: "02:00 PM",
                            class: "Math 12-B",
                            room: "Room 101",
                            duration: "50 min",
                            status: "upcoming",
                          },
                          {
                            time: "03:30 PM",
                            class: "Office Hours",
                            room: "Office",
                            duration: "90 min",
                            status: "upcoming",
                          },
                        ].map((schedule, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border-l-4 ${
                              schedule.status === "current"
                                ? "border-green-500 bg-green-50"
                                : schedule.status === "completed"
                                ? "border-gray-400 bg-gray-50"
                                : "border-blue-500 bg-blue-50"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm">
                                  {schedule.class}
                                </h4>
                                <p className="text-xs text-gray-600">
                                  {schedule.room} • {schedule.duration}
                                </p>
                              </div>
                              <span className="text-xs font-medium text-gray-900">
                                {schedule.time}
                              </span>
                            </div>
                            {schedule.status === "current" && (
                              <div className="mt-2">
                                <button
                                  className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                  onClick={() =>
                                    handleJoinClass(schedule.class)
                                  }
                                >
                                  Join Class
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Student Performance Overview */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Class Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          {
                            class: "Math 12-A",
                            average: 87,
                            trend: "+2",
                            status: "excellent",
                          },
                          {
                            class: "Math 12-B",
                            average: 82,
                            trend: "-1",
                            status: "good",
                          },
                          {
                            class: "Math 11-A",
                            average: 85,
                            trend: "+5",
                            status: "excellent",
                          },
                          {
                            class: "Math 11-B",
                            average: 79,
                            trend: "+1",
                            status: "average",
                          },
                        ].map((performance, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                {performance.class}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">
                                  {performance.average}%
                                </span>
                                <span
                                  className={`text-xs ${
                                    performance.trend.startsWith("+")
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {performance.trend}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  performance.status === "excellent"
                                    ? "bg-green-500"
                                    : performance.status === "good"
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                                }`}
                                style={{ width: `${performance.average}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            action: "New submission",
                            details: "Math 12-A Quiz - 5 new submissions",
                            time: "2h ago",
                            type: "submission",
                          },
                          {
                            action: "Assignment due",
                            details: "Math 11-A Homework due tomorrow",
                            time: "4h ago",
                            type: "reminder",
                          },
                          {
                            action: "Parent message",
                            details: "Message from Sarah's parent",
                            time: "1d ago",
                            type: "message",
                          },
                          {
                            action: "Grade published",
                            details: "Math 12-B Midterm grades released",
                            time: "2d ago",
                            type: "grade",
                          },
                        ].map((activity, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border-l-4 ${
                              activity.type === "submission"
                                ? "border-blue-500 bg-blue-50"
                                : activity.type === "reminder"
                                ? "border-orange-500 bg-orange-50"
                                : activity.type === "message"
                                ? "border-purple-500 bg-purple-50"
                                : "border-green-500 bg-green-50"
                            }`}
                          >
                            <h4 className="font-medium text-sm">
                              {activity.action}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {activity.details}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {activity.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* Modals and Overlays */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedAssignment.title || selectedAssignment.assignment}
              </h3>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {selectedAssignment.description ? (
              // Assignment Details
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Course:
                  </label>
                  <p className="text-gray-900">{selectedAssignment.course}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Due Date:
                  </label>
                  <p className="text-gray-900">{selectedAssignment.due}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Priority:
                  </label>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                      selectedAssignment.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : selectedAssignment.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {selectedAssignment.priority}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Description:
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedAssignment.description}
                  </p>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    onClick={() => {
                      alert(
                        `Starting assignment: ${selectedAssignment?.title}`
                      );
                      setSelectedAssignment(null);
                    }}
                  >
                    Start Assignment
                  </button>
                  <button
                    onClick={() => setSelectedAssignment(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              // Grade Details
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Course:
                  </label>
                  <p className="text-gray-900">{selectedAssignment.course}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Grade:
                  </label>
                  <p
                    className={`text-2xl font-bold ${
                      selectedAssignment.grade?.startsWith("A")
                        ? "text-green-600"
                        : selectedAssignment.grade?.startsWith("B")
                        ? "text-blue-600"
                        : "text-orange-600"
                    }`}
                  >
                    {selectedAssignment.grade}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Score:
                  </label>
                  <p className="text-gray-900">{selectedAssignment.score}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Date:
                  </label>
                  <p className="text-gray-900">{selectedAssignment.date}</p>
                </div>
                {selectedAssignment.feedback && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Feedback:
                    </label>
                    <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                      {selectedAssignment.feedback}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-4"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Class Details View */}
      {currentView === "class-details" && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedClass.class}</h3>
              <button
                onClick={() => setCurrentView("dashboard")}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Class Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">
                      {selectedClass.students}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average:</span>
                    <span className="font-medium text-green-600">
                      {selectedClass.average}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attendance:</span>
                    <span className="font-medium text-blue-600">
                      {selectedClass.attendance}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Class:</span>
                    <span className="font-medium">
                      {selectedClass.nextClass}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Recent Activities</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-blue-50 rounded text-sm">
                    <div className="font-medium">Quiz #5 Submitted</div>
                    <div className="text-gray-600">
                      23/28 students completed
                    </div>
                  </div>
                  <div className="p-2 bg-green-50 rounded text-sm">
                    <div className="font-medium">Homework Graded</div>
                    <div className="text-gray-600">
                      All assignments returned
                    </div>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded text-sm">
                    <div className="font-medium">Exam Scheduled</div>
                    <div className="text-gray-600">Next week Thursday</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleTakeAttendance(selectedClass)}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Take Attendance
              </button>
              <button
                onClick={() =>
                  handleJoinClass(
                    selectedClass?.class || selectedClass?.name || "Class"
                  )
                }
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                Join Class
              </button>
              <button
                onClick={() => setCurrentView("dashboard")}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance View */}
      {currentView === "attendance" && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Take Attendance - {selectedClass.class}
              </h3>
              <button
                onClick={() => setCurrentView("dashboard")}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600">
                Date: {new Date().toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                Total Students: {selectedClass.students}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {Array.from({ length: selectedClass.students }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <div className="font-medium">Student {i + 1}</div>
                    <div className="text-sm text-gray-600">ID: {1000 + i}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      onClick={() =>
                        alert(`Marked Student ${i + 1} as Present`)
                      }
                    >
                      Present
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      onClick={() => alert(`Marked Student ${i + 1} as Absent`)}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              )).slice(0, 8)}
            </div>

            <div className="flex space-x-3">
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                onClick={() => {
                  alert("Attendance saved successfully!");
                  setSelectedClass(null);
                }}
              >
                Save Attendance
              </button>
              <button
                onClick={() => setCurrentView("dashboard")}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grading View */}
      {currentView === "grading" && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Grade Assignment - {selectedAssignment.assignment}
              </h3>
              <button
                onClick={() => setCurrentView("dashboard")}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">Class: {selectedAssignment.class}</p>
              <p className="text-gray-600">
                Pending: {selectedAssignment.pending} submissions
              </p>
            </div>

            <div className="space-y-4">
              {Array.from({ length: selectedAssignment.pending }, (_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">Student {i + 1}</h4>
                      <p className="text-sm text-gray-600">
                        Submitted: 2 hours ago
                      </p>
                    </div>
                    <button
                      className="text-blue-500 hover:text-blue-700 text-sm"
                      onClick={() =>
                        alert(`Viewing submission from Student ${i + 1}`)
                      }
                    >
                      View Submission
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade
                      </label>
                      <input
                        type="text"
                        placeholder="Enter grade (A, B, C, etc.)"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Score
                      </label>
                      <input
                        type="text"
                        placeholder="Enter score (0-100)"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feedback
                    </label>
                    <textarea
                      placeholder="Enter feedback for the student..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  <div className="flex space-x-2 mt-3">
                    <button
                      className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      onClick={() => alert(`Grade saved for Student ${i + 1}`)}
                    >
                      Save Grade
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                      onClick={() =>
                        alert(`Skipped grading for Student ${i + 1}`)
                      }
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )).slice(0, 3)}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                onClick={() => {
                  alert("All grades saved successfully!");
                  setCurrentView("dashboard");
                }}
              >
                Save All Grades
              </button>
              <button
                onClick={() => setCurrentView("dashboard")}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
