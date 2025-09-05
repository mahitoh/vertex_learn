import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/dashboard/Header";
import SlidingSidebar from "@/components/dashboard/SlidingSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/UserContext";
import { useSidebar } from "@/contexts/SidebarContext";
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
  id: string;
  name: string;
  code: string;
  students: number;
  schedule: string;
  status: 'active' | 'completed' | 'upcoming';
  progress: number;
}

export default function TeacherCourses() {
  const isMobile = useIsMobile();
  const { user } = useUser();
  const {
    sidebarOpen,
    sidebarCollapsed,
    setSidebarOpen,
    toggleSidebar,
    toggleCollapse,
  } = useSidebar();

  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with actual API call
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/teacher/courses"],
    queryFn: () => Promise.resolve([
      {
        id: "1",
        name: "Advanced Mathematics",
        code: "MATH-401",
        students: 28,
        schedule: "Mon, Wed, Fri - 9:00 AM",
        status: "active",
        progress: 65
      },
      {
        id: "2",
        name: "Physics Laboratory",
        code: "PHYS-301",
        students: 24,
        schedule: "Tue, Thu - 2:00 PM",
        status: "active",
        progress: 45
      },
      {
        id: "3",
        name: "Chemistry Fundamentals",
        code: "CHEM-201",
        students: 32,
        schedule: "Mon, Wed - 11:00 AM",
        status: "active",
        progress: 78
      },
      {
        id: "4",
        name: "Biology Basics",
        code: "BIO-101",
        students: 30,
        schedule: "Tue, Thu - 10:00 AM",
        status: "completed",
        progress: 100
      }
    ])
  });

  const filteredCourses = courses?.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                      {courses?.reduce((sum, course) => sum + course.students, 0) || 0}
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
                      {courses?.filter(c => c.status === 'active').length || 0}
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
                    <p className="text-sm text-text-secondary">Avg Progress</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {courses ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length) : 0}%
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">%</span>
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
                        <span className="font-medium">{course.students}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Schedule:</span>
                        <span className="font-medium text-xs">{course.schedule}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Status:</span>
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">Progress:</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
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