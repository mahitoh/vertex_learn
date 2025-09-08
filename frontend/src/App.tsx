import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ToastProvider } from "@/components/notifications/ToastProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FinanceManagerDashboard from "./pages/FinanceManagerDashboard";
import AcademicDashboard from "@/pages/AcademicDashboard";
import Courses from "@/pages/courses";
import Attendance from "@/pages/attendance";
import Grades from "@/pages/grades";
import Schedule from "@/pages/schedule";
import Timetable from "@/pages/timetable";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import TeacherGrades from "@/pages/teacher/TeacherGrades";
import TeacherExams from "@/pages/teacher/TeacherExams";
import TeacherCourses from "@/pages/teacher/TeacherCourses";
import TeacherReports from "@/pages/teacher/TeacherReports";
import TeacherAttendance from "@/pages/teacher/TeacherAttendance";
import PaymentPortal from "@/pages/student/PaymentPortal";
import FinanceDashboard from "@/pages/admin/FinanceDashboard";
import MarketingFinanceDashboard from "@/pages/MarketingFinanceDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && user.role.toLowerCase() !== requiredRole.toLowerCase()) {
    // Redirect to their appropriate dashboard based on their actual role
    const userRole = user.role.toLowerCase();
    if (userRole === "super_admin") {
      return <Navigate to="/super-admin" replace />;
    } else if (userRole === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (userRole === "finance_manager") {
      return <Navigate to="/finance" replace />;
    } else if (userRole === "teacher") {
      return <Navigate to="/teacher" replace />;
    } else if (userRole === "student") {
      return <Navigate to="/student" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

// Dashboard Router Component - Redirects to role-specific URLs
const DashboardRouter = () => {
  const { user, isLoading } = useUser();

  // Show loading state while user data is being fetched
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if no user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Safely handle role comparison with better error handling
  if (!user.role) {
    console.error("User role is missing:", user);
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role.toLowerCase();

  // Redirect to role-specific URLs
  switch (userRole) {
    case "super_admin":
      return <Navigate to="/super-admin" replace />;
    case "admin":
      return <Navigate to="/admin" replace />;
    case "finance_manager":
      return <Navigate to="/finance" replace />;
    case "teacher":
      return <Navigate to="/teacher" replace />;
    case "student":
      return <Navigate to="/student" replace />;
    default:
      console.error("Unknown user role:", user.role);
      return <Navigate to="/login" replace />;
  }
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardRouter />
        </ProtectedRoute>
      }
    />
    <Route
      path="/super-admin"
      element={
        <ProtectedRoute requiredRole="super_admin">
          <SuperAdminDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin"
      element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/finance"
      element={
        <ProtectedRoute requiredRole="finance_manager">
          <FinanceManagerDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/teacher"
      element={
        <ProtectedRoute requiredRole="teacher">
          <AcademicDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/student"
      element={
        <ProtectedRoute requiredRole="student">
          <AcademicDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/courses"
      element={
        <ProtectedRoute>
          <Courses />
        </ProtectedRoute>
      }
    />
    <Route
      path="/schedule"
      element={
        <ProtectedRoute>
          <Schedule />
        </ProtectedRoute>
      }
    />
    <Route
      path="/attendance"
      element={
        <ProtectedRoute>
          <Attendance />
        </ProtectedRoute>
      }
    />
    <Route
      path="/grades"
      element={
        <ProtectedRoute>
          <Grades />
        </ProtectedRoute>
      }
    />
    <Route
      path="/timetable"
      element={
        <ProtectedRoute>
          <Timetable />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />
    <Route
      path="/settings"
      element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      }
    />
    <Route
      path="/teacher/grades"
      element={
        <ProtectedRoute requiredRole="teacher">
          <TeacherGrades />
        </ProtectedRoute>
      }
    />
    <Route
      path="/teacher/exams"
      element={
        <ProtectedRoute requiredRole="teacher">
          <TeacherExams />
        </ProtectedRoute>
      }
    />
    <Route
      path="/teacher/courses"
      element={
        <ProtectedRoute requiredRole="teacher">
          <TeacherCourses />
        </ProtectedRoute>
      }
    />
    <Route
      path="/teacher/reports"
      element={
        <ProtectedRoute requiredRole="teacher">
          <TeacherReports />
        </ProtectedRoute>
      }
    />
    <Route
      path="/teacher/attendance"
      element={
        <ProtectedRoute requiredRole="teacher">
          <TeacherAttendance />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/finance"
      element={
        <ProtectedRoute requiredRole="admin">
          <FinanceDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/student/payments"
      element={
        <ProtectedRoute requiredRole="student">
          <PaymentPortal />
        </ProtectedRoute>
      }
    />
    <Route
      path="/marketing-finance"
      element={
        <ProtectedRoute>
          <MarketingFinanceDashboard />
        </ProtectedRoute>
      }
    />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <SidebarProvider>
        <ToastProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </ToastProvider>
      </SidebarProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
