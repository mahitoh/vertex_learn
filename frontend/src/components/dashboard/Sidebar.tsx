import { 
  BarChart3,
  BookOpen,
  Calendar,
  UserCheck,
  TrendingUp,
  Clock,
  Settings,
  User
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  testId: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: BarChart3, path: "/", testId: "nav-dashboard" },
  { label: "My Courses", icon: BookOpen, path: "/courses", testId: "nav-courses" },
  { label: "My Schedule", icon: Calendar, path: "/schedule", testId: "nav-schedule" },
  { label: "My Attendance", icon: UserCheck, path: "/attendance", testId: "nav-attendance" },
  { label: "My Grades", icon: TrendingUp, path: "/grades", testId: "nav-grades" },
  { label: "Timetable", icon: Clock, path: "/timetable", testId: "nav-timetable" },
  { label: "Profile", icon: User, path: "/profile", testId: "nav-profile" },
  { label: "Settings", icon: Settings, path: "/settings", testId: "nav-settings" },
];

export default function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const [location] = useLocation();

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
            <span className="text-xl">🎓</span>
          </div>
          <h1 className="text-xl font-semibold whitespace-nowrap">Schooling</h1>
        </div>
      </div>
      
      {/* Dark Navigation Area */}
      <div className="bg-sidebar text-white h-full min-h-[calc(100vh-64px)]">
        <nav className="py-4">
          {/* Student Navigation Items */}
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
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
        </nav>
      </div>
    </aside>
  );
}