

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
import AdminDashboard from "./pages/AdminDashboard";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role.toLowerCase() !== requiredRole.toLowerCase()) {
    // Redirect to appropriate dashboard based on user's actual role
    const userRole = user.role.toLowerCase();
    const redirectPath = userRole === 'admin' ? '/admin' :
      userRole === 'teacher' ? '/teacher' :
        userRole === 'student' ? '/student' : '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// Dashboard Router Component - Redirects to role-specific URLs
const DashboardRouter = () => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to role-specific URLs
  switch (user.role.toLowerCase()) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'teacher':
      return <Navigate to="/teacher" replace />;
    case 'student':
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/admin" replace />;
  }
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <DashboardRouter />
      </ProtectedRoute>
    } />
    <Route path="/admin" element={
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    } />
    <Route path="/teacher" element={
      <ProtectedRoute requiredRole="teacher">
        <AcademicDashboard />
      </ProtectedRoute>
    } />
    <Route path="/student" element={
      <ProtectedRoute requiredRole="student">
        <AcademicDashboard />
      </ProtectedRoute>
    } />
    <Route path="/courses" element={
      <ProtectedRoute>
        <Courses />
      </ProtectedRoute>
    } />
    <Route path="/schedule" element={
      <ProtectedRoute>
        <Schedule />
      </ProtectedRoute>
    } />
    <Route path="/attendance" element={
      <ProtectedRoute>
        <Attendance />
      </ProtectedRoute>
    } />
    <Route path="/grades" element={
      <ProtectedRoute>
        <Grades />
      </ProtectedRoute>
    } />
    <Route path="/timetable" element={
      <ProtectedRoute>
        <Timetable />
      </ProtectedRoute>
    } />
    <Route path="/profile" element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    } />
    <Route path="/settings" element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    } />
    <Route path="/teacher/grades" element={
      <ProtectedRoute requiredRole="teacher">
        <TeacherGrades />
      </ProtectedRoute>
    } />
    <Route path="/teacher/exams" element={
      <ProtectedRoute requiredRole="teacher">
        <TeacherExams />
      </ProtectedRoute>
    } />
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
