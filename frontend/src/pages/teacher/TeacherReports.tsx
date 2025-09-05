import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  FileText, 
  Download, 
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Calendar,
  Eye
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentReport {
  id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  course_id: number;
  course_name: string;
  course_code: string;
  average_grade: number;
  attendance_percentage: number;
  total_assignments: number;
  completed_assignments: number;
  last_activity: string;
}

interface Grade {
  id: number;
  student_id: number;
  course_id: number;
  assignment_type: string;
  score: number;
  max_score: number;
  percentage: number;
  created_at: string;
}

export default function TeacherReports() {
  const isMobile = useIsMobile();
  const { user } = useUser();
  const { toast } = useToast();
  const {
    sidebarOpen,
    sidebarCollapsed,
    setSidebarOpen,
    toggleSidebar,
    toggleCollapse,
  } = useSidebar();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");

  // Fetch teacher's courses
  const { data: coursesResponse } = useQuery({
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

  // Fetch grades for teacher's courses
  const { data: gradesResponse, isLoading } = useQuery({
    queryKey: ["/api/grades", selectedCourse],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCourse !== "all") {
        params.append('courseId', selectedCourse);
      }
      
      const response = await fetch(`/api/grades?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch grades');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Process grades data to create student reports
  const reports: StudentReport[] = [];
  if (gradesResponse?.data) {
    const studentMap = new Map();
    
    gradesResponse.data.forEach((grade: any) => {
      const key = `${grade.student_id}-${grade.course_id}`;
      if (!studentMap.has(key)) {
        studentMap.set(key, {
          id: grade.id,
          student_id: grade.student_id,
          student_name: `${grade.student_first_name} ${grade.student_last_name}`,
          student_email: grade.student_email,
          course_id: grade.course_id,
          course_name: grade.course_name,
          course_code: grade.course_code,
          grades: [],
          total_assignments: 0,
          completed_assignments: 0,
          last_activity: grade.created_at
        });
      }
      
      const student = studentMap.get(key);
      student.grades.push(grade);
      student.total_assignments++;
      if (grade.score > 0) student.completed_assignments++;
    });

    studentMap.forEach((student) => {
      const averageGrade = student.grades.length > 0 
        ? student.grades.reduce((sum: number, g: any) => sum + (g.score / g.max_score * 100), 0) / student.grades.length 
        : 0;
      
      reports.push({
        ...student,
        average_grade: Math.round(averageGrade),
        attendance_percentage: Math.floor(Math.random() * 30) + 70, // Mock attendance data
        last_activity: new Date(student.last_activity).toLocaleDateString()
      });
    });
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.student_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || report.course_id.toString() === selectedCourse;
    
    return matchesSearch && matchesCourse;
  });

  const getStatusColor = (grade: number, attendance: number) => {
    if (grade >= 90 && attendance >= 90) return 'bg-green-100 text-green-800';
    if (grade >= 75 && attendance >= 80) return 'bg-blue-100 text-blue-800';
    if (grade >= 60 && attendance >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (grade: number, attendance: number) => {
    if (grade >= 90 && attendance >= 90) return 'Excellent';
    if (grade >= 75 && attendance >= 80) return 'Good';
    if (grade >= 60 && attendance >= 70) return 'Needs Attention';
    return 'At Risk';
  };

  const getGradeIcon = (grade: number) => {
    return grade >= 80 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getMainMargin = () => {
    if (isMobile) return '';
    return sidebarCollapsed ? 'ml-16' : 'ml-64';
  };

  const exportReports = () => {
    // Implementation for exporting reports
    console.log("Exporting reports...");
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
                  Student Reports
                </h1>
                <p className="text-text-secondary mt-1">
                  Monitor student performance, attendance, and engagement across all courses
                </p>
              </div>
              <Button onClick={exportReports} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Reports
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Total Students</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {reports.length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Avg Grade</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {reports.length > 0 ? Math.round(reports.reduce((sum, r) => sum + r.average_grade, 0) / reports.length) : 0}%
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Avg Attendance</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {reports.length > 0 ? Math.round(reports.reduce((sum, r) => sum + r.attendance_percentage, 0) / reports.length) : 0}%
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
                    <p className="text-sm text-text-secondary">At Risk</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {reports.filter(r => r.average_grade < 60 || r.attendance_percentage < 70).length}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course: any) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Performance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Assignments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{report.student_name}</div>
                            <div className="text-sm text-text-secondary">{report.student_email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {report.course_name} ({report.course_code})
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getGradeIcon(report.average_grade)}
                            <span className="font-medium">{report.average_grade}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${report.attendance_percentage >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                            {report.attendance_percentage}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {report.completed_assignments}/{report.total_assignments}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.average_grade, report.attendance_percentage)}>
                            {getStatusText(report.average_grade, report.attendance_percentage)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-text-secondary">
                          {report.last_activity}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}