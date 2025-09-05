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
  id: string;
  studentId: string;
  name: string;
  course: string;
  averageGrade: number;
  attendance: number;
  assignments: {
    completed: number;
    total: number;
  };
  lastActivity: string;
  status: 'excellent' | 'good' | 'needs-attention' | 'at-risk';
}

export default function TeacherReports() {
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
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Mock data - replace with actual API call
  const { data: reports, isLoading } = useQuery<StudentReport[]>({
    queryKey: ["/api/teacher/reports", selectedCourse, selectedStatus],
    queryFn: () => Promise.resolve([
      {
        id: "1",
        studentId: "STU001",
        name: "Alice Johnson",
        course: "Advanced Mathematics",
        averageGrade: 92,
        attendance: 95,
        assignments: { completed: 18, total: 20 },
        lastActivity: "2 hours ago",
        status: "excellent"
      },
      {
        id: "2",
        studentId: "STU002",
        name: "Bob Smith",
        course: "Physics Laboratory",
        averageGrade: 78,
        attendance: 88,
        assignments: { completed: 15, total: 18 },
        lastActivity: "1 day ago",
        status: "good"
      },
      {
        id: "3",
        studentId: "STU003",
        name: "Carol Davis",
        course: "Chemistry Fundamentals",
        averageGrade: 65,
        attendance: 72,
        assignments: { completed: 12, total: 16 },
        lastActivity: "3 days ago",
        status: "needs-attention"
      },
      {
        id: "4",
        studentId: "STU004",
        name: "David Wilson",
        course: "Advanced Mathematics",
        averageGrade: 45,
        attendance: 60,
        assignments: { completed: 8, total: 20 },
        lastActivity: "1 week ago",
        status: "at-risk"
      },
      {
        id: "5",
        studentId: "STU005",
        name: "Eva Brown",
        course: "Physics Laboratory",
        averageGrade: 88,
        attendance: 92,
        assignments: { completed: 17, total: 18 },
        lastActivity: "4 hours ago",
        status: "excellent"
      }
    ])
  });

  const courses = ["Advanced Mathematics", "Physics Laboratory", "Chemistry Fundamentals", "Biology Basics"];

  const filteredReports = reports?.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || report.course === selectedCourse;
    const matchesStatus = selectedStatus === "all" || report.status === selectedStatus;
    
    return matchesSearch && matchesCourse && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs-attention': return 'bg-yellow-100 text-yellow-800';
      case 'at-risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                      {reports?.length || 0}
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
                      {reports ? Math.round(reports.reduce((sum, r) => sum + r.averageGrade, 0) / reports.length) : 0}%
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
                      {reports ? Math.round(reports.reduce((sum, r) => sum + r.attendance, 0) / reports.length) : 0}%
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
                      {reports?.filter(r => r.status === 'at-risk').length || 0}
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
                    {courses.map(course => (
                      <SelectItem key={course} value={course}>{course}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="needs-attention">Needs Attention</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
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
                            <div className="font-medium">{report.name}</div>
                            <div className="text-sm text-text-secondary">{report.studentId}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{report.course}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getGradeIcon(report.averageGrade)}
                            <span className="font-medium">{report.averageGrade}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${report.attendance >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                            {report.attendance}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {report.assignments.completed}/{report.assignments.total}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-text-secondary">
                          {report.lastActivity}
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