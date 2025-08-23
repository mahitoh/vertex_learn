import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import AcademicCalendar from "@/components/dashboard/AcademicCalendar";
import ActionButtons from "@/components/dashboard/ActionButtons";
import GradeDistributionChart from "@/components/dashboard/GradeDistributionChart";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DashboardStats, CalendarEvent, GradeDistribution } from "@/types/dashboard";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar 
} from "lucide-react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: events, isLoading: eventsLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/events"],
  });

  const { data: gradeDistribution, isLoading: gradesLoading } = useQuery<GradeDistribution>({
    queryKey: ["/api/grades/distribution"],
  });

  const statsCards = [
    {
      icon: GraduationCap,
      value: stats?.totalStudents || 0,
      label: "Total Students",
      color: "bg-blue-100 text-blue-600",
      testId: "stat-total-students"
    },
    {
      icon: Users,
      value: stats?.totalEmployees || 0,
      label: "Total Employees", 
      color: "bg-red-100 text-red-600",
      testId: "stat-total-employees"
    },
    {
      icon: BookOpen,
      value: stats?.totalSubjects || 0,
      label: "Total Subjects",
      color: "bg-yellow-100 text-yellow-600",
      testId: "stat-total-subjects"
    },
    {
      icon: Calendar,
      value: stats?.totalHolidays || 0,
      label: "Total Holidays",
      color: "bg-green-100 text-green-600",
      testId: "stat-total-holidays"
    },
  ];

  return (
    <div className="min-h-screen bg-content-bg">
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
        isMobile={isMobile}
      />
      
      <div className="flex pt-16">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />
        
        <main className={`flex-1 p-4 sm:p-6 transition-all duration-300 ${
          isMobile ? '' : 'ml-64'
        }`}>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Academic Calendar */}
            <div className="lg:col-span-2">
              <AcademicCalendar 
                events={events || []}
                isLoading={eventsLoading}
              />
            </div>

            {/* Right Side Actions and Charts */}
            <div className="space-y-6">
              <ActionButtons />
              <GradeDistributionChart 
                gradeData={gradeDistribution || { A: 0, B: 0, C: 0 }}
                isLoading={gradesLoading}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}
    </div>
  );
}
