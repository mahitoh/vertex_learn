// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Index from "./pages/Index";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import NotFound from "./pages/NotFound";

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Index />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/UserContext";
import { ToastProvider } from "@/components/notifications/ToastProvider";
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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AcademicDashboard} />
      <Route path="/courses" component={Courses} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/grades" component={Grades} />
      <Route path="/timetable" component={Timetable} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/teacher/grades" component={TeacherGrades} />
      <Route path="/teacher/exams" component={TeacherExams} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ToastProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </ToastProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
