import { useQuery } from "@tanstack/react-query";
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
import type { DashboardStats, CalendarEvent, GradeDistribution } from "@/types/dashboard";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoleSwitcher from "@/components/RoleSwitcher";

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

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: events, isLoading: eventsLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/events"],
  });

  const { data: gradeDistribution, isLoading: gradesLoading } = useQuery<GradeDistribution>({
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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access the academic dashboard.</p>
        </div>
      </div>
    );
  }

  // Student-specific stats
  const studentStatsCards = [
    {
      icon: BookOpen,
      value: 6,
      label: "Enrolled Courses",
      color: "bg-blue-100 text-blue-600",
      testId: "stat-enrolled-courses"
    },
    {
      icon: TrendingUp,
      value: 3.8,
      label: "Current GPA",
      color: "bg-green-100 text-green-600",
      testId: "stat-current-gpa"
    },
    {
      icon: UserCheck,
      value: 92,
      label: "Attendance Rate",
      color: "bg-purple-100 text-purple-600",
      testId: "stat-attendance-rate"
    },
    {
      icon: Calendar,
      value: 3,
      label: "Upcoming Exams",
      color: "bg-red-100 text-red-600",
      testId: "stat-upcoming-exams"
    },
  ];

  // Teacher-specific stats
  const teacherStatsCards = [
    {
      icon: Users,
      value: stats?.totalStudents || 0,
      label: "Total Students",
      color: "bg-blue-100 text-blue-600",
      testId: "stat-total-students"
    },
    {
      icon: BookOpen,
      value: 4,
      label: "Courses Teaching",
      color: "bg-green-100 text-green-600",
      testId: "stat-courses-teaching"
    },
    {
      icon: Calendar,
      value: 12,
      label: "Scheduled Exams",
      color: "bg-yellow-100 text-yellow-600",
      testId: "stat-scheduled-exams"
    },
    {
      icon: GraduationCap,
      value: 85,
      label: "Class Average",
      color: "bg-purple-100 text-purple-600",
      testId: "stat-class-average"
    },
  ];

  const statsCards = isStudent ? studentStatsCards : teacherStatsCards;

  // Student grade data for charts
  const studentGradeData = {
    labels: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'],
    datasets: [{
      label: 'Current Grades',
      data: [85, 78, 92, 88, 90],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      borderColor: ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED'],
      borderWidth: 2
    }]
  };

  // Teacher class performance data
  const classPerformanceData = {
    labels: ['Grade 12-A', 'Grade 12-B', 'Grade 11-A', 'Grade 11-B'],
    datasets: [{
      label: 'Average Score',
      data: [85, 78, 82, 75],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
      borderColor: ['#2563EB', '#059669', '#D97706', '#DC2626'],
      borderWidth: 2
    }]
  };

  // Calculate main content margin based on sidebar state
  const getMainMargin = () => {
    if (isMobile) return '';
    return sidebarCollapsed ? 'ml-16' : 'ml-64';
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
        
        <main className={`flex-1 p-3 sm:p-4 lg:p-6 transition-all duration-300 ${getMainMargin()}`}>
          {/* Welcome Section */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-sm sm:text-base text-text-secondary">
              {isStudent ? "Track your academic progress and stay updated with your courses." :
               isTeacher ? "Manage your classes, track student progress, and schedule exams." :
               "Manage the academic system and monitor overall performance."}
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
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
              {/* Student Academic Calendar */}
              <div className="xl:col-span-2 order-2 xl:order-1">
                <AcademicCalendar 
                  events={events || []}
                  isLoading={eventsLoading}
                />
              </div>

              {/* Right Side - Charts and Quick Actions */}
              <div className="space-y-4 sm:space-y-6 order-1 xl:order-2">
                <ActionButtons />
                
                {/* Personal Grade Chart */}
                <InteractiveChart
                  title="My Grades"
                  data={studentGradeData}
                  type="bar"
                  filterOptions={['current term', 'all terms']}
                  isLoading={gradesLoading}
                />
                
                {/* Attendance Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Attendance Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="truncate mr-2">Mathematics</span>
                        <span className="font-medium">95%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="truncate mr-2">Physics</span>
                        <span className="font-medium">88%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="truncate mr-2">Chemistry</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between items-center font-semibold text-sm">
                        <span>Overall</span>
                        <span className="text-green-600">92%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : isTeacher ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Teacher Dashboard Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Grade Management */}
                <GradeManagement isLoading={statsLoading} />
                
                {/* Class Performance Chart */}
                <InteractiveChart
                  title="Class Performance"
                  data={classPerformanceData}
                  type="bar"
                  filterOptions={['this term', 'last term', 'all terms']}
                  isLoading={gradesLoading}
                />
              </div>
              
              {/* Exam Calendar */}
              <ExamCalendar isLoading={eventsLoading} />
              
              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-blue-50 rounded-lg gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">Grade 12-A Mathematics Quiz</p>
                        <p className="text-xs text-gray-600">15 students submitted</p>
                      </div>
                      <span className="text-xs sm:text-sm text-blue-600 flex-shrink-0">2 hours ago</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-green-50 rounded-lg gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">Physics Lab Report</p>
                        <p className="text-xs text-gray-600">Graded 20 submissions</p>
                      </div>
                      <span className="text-xs sm:text-sm text-green-600 flex-shrink-0">1 day ago</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-yellow-50 rounded-lg gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">Chemistry Midterm</p>
                        <p className="text-xs text-gray-600">Scheduled for next week</p>
                      </div>
                      <span className="text-xs sm:text-sm text-yellow-600 flex-shrink-0">Upcoming</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </main>
      </div>
      
      {/* Role Switcher for Demo */}
      <RoleSwitcher />
    </div>
  );
}