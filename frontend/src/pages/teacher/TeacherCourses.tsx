import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/dashboard/Header";
import SlidingSidebar from "@/components/dashboard/SlidingSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/UserContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Plus,
  Search,
  Edit,
  Eye,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Course {
  id: number;
  name: string;
  code: string;
  credits: number;
  description?: string;
  instructor_id: number;
  instructor_name?: string;
  instructor_email?: string;
  is_active: boolean;
  student_count: number;
  grade_count: number;
  created_at: string;
  updated_at: string;
}

export default function TeacherCourses() {
  const isMobile = useIsMobile();
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    sidebarOpen,
    sidebarCollapsed,
    setSidebarOpen,
    toggleSidebar,
    toggleCollapse,
  } = useSidebar();

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch courses for the current teacher
  const { data: coursesResponse, isLoading } = useQuery({
    queryKey: ["/api/courses/instructor", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/courses/instructor/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    enabled: !!user?.id
  });

  const courses = coursesResponse?.courses || [];

  const filteredCourses = courses.filter((course: Course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const getMainMargin = () => {
    if (isMobile) return '';
    return sidebarCollapsed ? 'ml-16' : 'ml-64';
  };

  return (
    <div className="min-h-screen bg-content-bg">
      <Header 
        onMenuToggle={toggleSidebar}
        isMobile={isMobile}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleCollapse}
        sidebarWidth={sidebarCollapsed ? 64 : 256}
      />
      
      <div className="flex pt-16">
        <SlidingSidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleCollapse}
        />
        
        <main className={`flex-1 p-3 sm:p-4 lg:p-6 transition-all duration-300 ${getMainMargin()}`}>
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                  Course Management
                </h1>
                <p className="text-text-secondary mt-1">
                  Manage your courses, track progress, and monitor student engagement
                </p>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Course
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Total Courses</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {courses?.length || 0}
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Total Students</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {courses.reduce((sum: number, course: Course) => sum + course.student_count, 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Active Courses</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {courses.filter((c: Course) => c.is_active).length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Total Grades</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {courses.reduce((sum: number, course: Course) => sum + course.grade_count, 0)}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">#</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-text-primary">
                          {course.name}
                        </CardTitle>
                        <p className="text-sm text-text-secondary mt-1">
                          {course.code}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Course
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Students:</span>
                        <span className="font-medium">{course.student_count}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Credits:</span>
                        <span className="font-medium">{course.credits}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Status:</span>
                        <Badge className={getStatusColor(course.is_active)}>
                          {getStatusText(course.is_active)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">Grades:</span>
                          <span className="font-medium">{course.grade_count}</span>
                        </div>
                        {course.description && (
                          <p className="text-xs text-text-secondary line-clamp-2">
                            {course.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}