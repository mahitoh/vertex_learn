import Header from "@/components/dashboard/Header";
import RoleBasedSidebar from "@/components/dashboard/RoleBasedSidebar";
import GradeManagement from "@/components/teacher/GradeManagement";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export default function TeacherGrades() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-content-bg">
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
        isMobile={isMobile}
      />
      
      <div className="flex pt-16">
        <RoleBasedSidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />
        
        <main className={`flex-1 p-6 transition-all duration-300 ${
          isMobile ? '' : 'ml-64'
        }`}>
          <GradeManagement />
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