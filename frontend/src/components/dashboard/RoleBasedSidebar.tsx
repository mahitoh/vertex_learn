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
  Edit
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  testId: string;
  roles: ('student' | 'teacher' | 'admin')[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const menuItems: MenuItem[] = [
  // Dashboard - Available to all
  { label: "Dashboard", icon: BarChart3, path: "/", testId: "nav-dashboard", roles: ['student', 'teacher', 'admin'] },
  
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

export default function RoleBasedSidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const [location] = useLocation();
  const { user, isStudent, isTeacher } = useUser();

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

  return (
    <aside 
      className={cn(
        "w-64 fixed left-0 top-0 h-screen overflow-y-auto z-40 transition-transform duration-300 shadow-lg",
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      )}
    >
      {/* Pink Header */}
      <div className="bg-primary text-white p-4 flex items-center justify-center min-h-[64px]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">{getRoleIcon()}</span>
          </div>
          <h1 className="text-xl font-semibold whitespace-nowrap">Schooling</h1>
        </div>
      </div>
      
      {/* Role Indicator */}
      <div className="bg-primary-dark bg-opacity-90 text-white px-4 py-2 text-center">
        <span className="text-sm font-medium">{getRoleTitle()}</span>
      </div>
      
      {/* Dark Navigation Area */}
      <div className="bg-sidebar text-white h-full min-h-[calc(100vh-96px)]">
        <nav className="py-4">
          {/* Navigation Items */}
          <ul className="space-y-1">
            {filteredMenuItems.map((item, index) => {
              const isActive = location === item.path;
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 text-sm transition-colors cursor-pointer hover:no-underline no-underline",
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-300 hover:bg-sidebar-hover"
                    )}
                    data-testid={item.testId}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className={cn(
                      "flex-1 whitespace-nowrap",
                      isActive ? "font-medium" : ""
                    )}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {/* User Info */}
          <div className="mt-8 px-4 py-3 border-t border-sidebar-hover">
            <div className="flex items-center space-x-3">
              <img 
                src={user.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-300 truncate">
                  {isStudent && user.studentId ? `ID: ${user.studentId}` : user.email}
                </p>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}