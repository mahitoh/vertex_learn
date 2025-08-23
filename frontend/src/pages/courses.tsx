import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export default function Courses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

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
        
        <main className={`flex-1 p-6 transition-all duration-300 ${
          isMobile ? '' : 'ml-64'
        }`}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-text-primary mb-6">Course Details</h1>
            <div className="bg-card-bg rounded-xl p-8 shadow-sm border border-gray-100">
              <p className="text-text-secondary text-lg">Course management functionality will be implemented here.</p>
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