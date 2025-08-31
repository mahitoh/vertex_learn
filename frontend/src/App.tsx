// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { UserProvider } from "@/contexts/UserContext";
// import { SidebarProvider } from "@/contexts/SidebarContext";
// import { ToastProvider } from "@/components/notifications/ToastProvider";
// import AcademicDashboard from "@/pages/AcademicDashboard";
// import Courses from "@/pages/courses";
// import Attendance from "@/pages/attendance";
// import Grades from "@/pages/grades";
// import Schedule from "@/pages/schedule";
// import Timetable from "@/pages/timetable";
// import Profile from "@/pages/profile";
// import Settings from "@/pages/settings";
// import TeacherGrades from "@/pages/teacher/TeacherGrades";
// import TeacherExams from "@/pages/teacher/TeacherExams";
// import NotFound from "@/pages/not-found";

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <UserProvider>
//       <SidebarProvider>
//         <ToastProvider>
//           <TooltipProvider>
//             <Toaster />
//             <Sonner />
//             <BrowserRouter>
//               <Routes>
//                 <Route path="/" element={<AcademicDashboard />} />
//                 <Route path="/dashboard" element={<AcademicDashboard />} />
//                 <Route path="/courses" element={<Courses />} />
//                 <Route path="/schedule" element={<Schedule />} />
//                 <Route path="/attendance" element={<Attendance />} />
//                 <Route path="/grades" element={<Grades />} />
//                 <Route path="/timetable" element={<Timetable />} />
//                 <Route path="/profile" element={<Profile />} />
//                 <Route path="/settings" element={<Settings />} />
//                 <Route path="/teacher/grades" element={<TeacherGrades />} />
//                 <Route path="/teacher/exams" element={<TeacherExams />} />
//                 {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
//                 <Route path="*" element={<NotFound />} />
//               </Routes>
//             </BrowserRouter>
//           </TooltipProvider>
//         </ToastProvider>
//       </SidebarProvider>
//     </UserProvider>
//   </QueryClientProvider>
// );

// export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "@/contexts/UserContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
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

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <div>Teacher Dashboard (Coming Soon)</div>;
    case 'student':
      return <div>Student Dashboard (Coming Soon)</div>;
    default:
      return <Navigate to="/" replace />;
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
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
