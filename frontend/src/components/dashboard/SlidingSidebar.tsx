import { 
  BarChart3,
  BookOpen,
  Calendar,
  UserCheck,
  TrendingUp,
  Clock,
  Settings,
  User,
  GraduationCap,
  Users,
  FileText,
  PlusCircle,
  Edit,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  testId: string;
  roles: ('student' | 'teacher' | 'admin')[];
}

interface SlidingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems: MenuItem[] = [
  // Dashboard - Available to all
  { label: "Dashboard", icon: BarChart3, path: "/dashboard", testId: "nav-dashboard", roles: ['student', 'teacher', 'admin'] },
  
  // Student-specific items
  { label: "My Courses", icon: BookOpen, path: "/courses", testId: "nav-courses", roles: ['student'] },
  { label: "My Schedule", icon: Calendar, path: "/schedule", testId: "nav-schedule", roles: ['student'] },
  { label: "My Attendance", icon: UserCheck, path: "/attendance", testId: "nav-attendance", roles: ['student'] },
  { label: "My Grades", icon: TrendingUp, path: "/grades", testId: "nav-grades", roles: ['student'] },
  
  // Teacher-specific items
  { label: "Course Management", icon: BookOpen, path: "/teacher/courses", testId: "nav-teacher-courses", roles: ['teacher'] },
  { label: "Grade Management", icon: Edit, path: "/teacher/grades", testId: "nav-teacher-grades", roles: ['teacher'] },
  { label: "Exam Calendar", icon: Calendar, path: "/teacher/exams", testId: "nav-teacher-exams", roles: ['teacher'] },
  { label: "Student Reports", icon: FileText, path: "/teacher/reports", testId: "nav-teacher-reports", roles: ['teacher'] },
  { label: "Attendance Tracking", icon: UserCheck, path: "/teacher/attendance", testId: "nav-teacher-attendance", roles: ['teacher'] },
  
  // Shared items
  { label: "Timetable", icon: Clock, path: "/timetable", testId: "nav-timetable", roles: ['student', 'teacher'] },
  { label: "Profile", icon: User, path: "/profile", testId: "nav-profile", roles: ['student', 'teacher', 'admin'] },
  { label: "Settings", icon: Settings, path: "/settings", testId: "nav-settings", roles: ['student', 'teacher', 'admin'] },
];

export default function SlidingSidebar({ 
  isOpen, 
  onClose, 
  isMobile, 
  isCollapsed, 
  onToggleCollapse 
}: SlidingSidebarProps) {
  const location = useLocation();
  const { user, isStudent, isTeacher } = useUser();
  const [hovering, setHovering] = useState(false);

  if (!user) {
    return null;
  }

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  const getRoleTitle = () => {
    if (isStudent) return "Student Portal";
    if (isTeacher) return "Teacher Portal";
    return "Academic Portal";
  };

  const getRoleIcon = () => {
    if (isStudent) return "🎓";
    if (isTeacher) return "👨‍🏫";
    return "🏫";
  };

  const sidebarWidth = isMobile ? 'w-64' : (isCollapsed && !hovering ? 'w-16' : 'w-64');
  const shouldShowText = isMobile || !isCollapsed || hovering;

  return (
    <>
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen z-40 transition-all duration-300 shadow-lg flex flex-col",
          sidebarWidth,
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
        )}
        onMouseEnter={() => !isMobile && setHovering(true)}
        onMouseLeave={() => !isMobile && setHovering(false)}
      >
        {/* Pink Header */}
        <div className="bg-primary text-white p-4 flex items-center justify-between h-16 flex-shrink-0">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">{getRoleIcon()}</span>
            </div>
            {shouldShowText && (
              <h1 className="text-xl font-semibold whitespace-nowrap">
                Schooling
              </h1>
            )}
          </div>
          
          {/* Collapse Toggle - Desktop Only */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="text-white hover:bg-white hover:bg-opacity-20 p-1 h-8 w-8 flex-shrink-0"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        {/* Role Indicator - Only show when text should be visible */}
        {shouldShowText && (
          <div className="bg-primary-dark text-white px-4 py-2 text-center flex-shrink-0">
            <span className="text-sm font-medium text-white">{getRoleTitle()}</span>
          </div>
        )}
        
        {/* Dark Navigation Area - Full remaining height */}
        <div className="bg-sidebar text-white flex-1 overflow-y-auto flex flex-col">
          <nav className="py-4 flex-1 flex flex-col">
            {/* Navigation Items */}
            <ul className="space-y-1 flex-1">
              {filteredMenuItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={index}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-200 cursor-pointer hover:no-underline no-underline group",
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-300 hover:bg-sidebar-hover",
                        !shouldShowText && "justify-center px-2"
                      )}
                      data-testid={item.testId}
                      title={!shouldShowText ? item.label : undefined}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {shouldShowText && (
                        <span className={cn(
                          "flex-1 whitespace-nowrap",
                          isActive ? "font-medium" : ""
                        )}>
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            
            {/* User Info - Positioned at bottom */}
            <div className="mt-auto pt-4 px-4 py-3 border-t border-sidebar-hover">
              <div className={cn(
                "flex items-center space-x-3",
                !shouldShowText && "justify-center"
              )}>
                <img 
                  src={user.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                {shouldShowText && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-300 truncate">
                      {isStudent && user.studentId ? `ID: ${user.studentId}` : user.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}
    </>
  );
}