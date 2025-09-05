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
  UserCheck, 
  UserX, 
  Calendar, 
  Search,
  Filter,
  Download,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle
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

interface AttendanceRecord {
  id: number;
  student_id: number;
  course_id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  student_name?: string;
  student_email?: string;
  course_name?: string;
  course_code?: string;
  created_at: string;
}

interface AttendanceSummary {
  student_id: number;
  student_name: string;
  student_email: string;
  course_id: number;
  course_name: string;
  course_code: string;
  total_classes: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export default function TeacherAttendance() {
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
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'daily' | 'summary'>('daily');

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

  // Fetch attendance records
  const { data: attendanceResponse, isLoading: recordsLoading } = useQuery({
    queryKey: ["/api/attendance", selectedDate, selectedCourse],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedCourse !== "all") params.append('courseId', selectedCourse);
      
      const response = await fetch(`/api/attendance?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    },
    enabled: !!user?.id
  });

  const attendanceRecords = attendanceResponse?.data || []; 
  // Generate attendance summary from records
  const attendanceSummary: AttendanceSummary[] = [];
  if (attendanceRecords.length > 0) {
    const studentMap = new Map();
    
    attendanceRecords.forEach((record: AttendanceRecord) => {
      const key = `${record.student_id}-${record.course_id}`;
      if (!studentMap.has(key)) {
        studentMap.set(key, {
          student_id: record.student_id,
          student_name: record.student_name || 'Unknown Student',
          student_email: record.student_email || '',
          course_id: record.course_id,
          course_name: record.course_name || 'Unknown Course',
          course_code: record.course_code || '',
          total_classes: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        });
      }
      
      const student = studentMap.get(key);
      student.total_classes++;
      student[record.status]++;
    });

    studentMap.forEach((student) => {
      student.percentage = student.total_classes > 0 
        ? Math.round((student.present / student.total_classes) * 100) 
        : 0;
      attendanceSummary.push(student);
    });
  }

  const filteredRecords = attendanceRecords.filter((record: AttendanceRecord) => {
    const matchesSearch = (record.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.student_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || record.course_id.toString() === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const filteredSummary = attendanceSummary.filter((summary: AttendanceSummary) => {
    const matchesSearch = summary.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         summary.student_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || summary.course_id.toString() === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'absent': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'late': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'excused': return <UserCheck className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getMainMargin = () => {
    if (isMobile) return '';
    return sidebarCollapsed ? 'ml-16' : 'ml-64';
  };

  // Mutation for marking attendance
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, courseId, date, status }: {
      studentId: number;
      courseId: number;
      date: string;
      status: string;
    }) => {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          studentId,
          courseId,
          date,
          status
        })
      });
      if (!response.ok) throw new Error('Failed to mark attendance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    }
  });

  const markAttendance = (studentId: number, courseId: number, status: string) => {
    markAttendanceMutation.mutate({
      studentId,
      courseId,
      date: selectedDate,
      status
    });
  };

  const exportAttendance = () => {
    // Implementation for exporting attendance
    console.log("Exporting attendance...");
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
                  Attendance Tracking
                </h1>
                <p className="text-text-secondary mt-1">
                  Track and manage student attendance across all your courses
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === 'daily' ? 'default' : 'outline'}
                  onClick={() => setViewMode('daily')}
                >
                  Daily View
                </Button>
                <Button 
                  variant={viewMode === 'summary' ? 'default' : 'outline'}
                  onClick={() => setViewMode('summary')}
                >
                  Summary View
                </Button>
                <Button onClick={exportAttendance} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Total Students</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {attendanceSummary.length}
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
                    <p className="text-sm text-text-secondary">Present Today</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {attendanceRecords.filter((r: AttendanceRecord) => r.status === 'present').length}
                    </p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Absent Today</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {attendanceRecords.filter((r: AttendanceRecord) => r.status === 'absent').length}
                    </p>
                  </div>
                  <UserX className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Avg Attendance</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {attendanceSummary.length > 0 ? Math.round(attendanceSummary.reduce((sum, s) => sum + s.percentage, 0) / attendanceSummary.length) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
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

                {viewMode === 'daily' && (
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                )}

                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Take Attendance
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content based on view mode */}
          {viewMode === 'daily' ? (
            <Card>
              <CardHeader>
                <CardTitle>Daily Attendance - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
              </CardHeader>
              <CardContent>
                {recordsLoading ? (
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
                        <TableHead>Status</TableHead>
                        <TableHead>Time In</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{record.student_name}</div>
                              <div className="text-sm text-text-secondary">{record.student_email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {record.course_name} ({record.course_code})
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(record.status)}
                              <Badge className={getStatusColor(record.status)}>
                                {record.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(record.created_at).toLocaleTimeString()}
                          </TableCell>
                          <TableCell className="text-sm">-</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => markAttendance(record.student_id, record.course_id, 'present')}
                                disabled={markAttendanceMutation.isPending}
                              >
                                P
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => markAttendance(record.student_id, record.course_id, 'absent')}
                                disabled={markAttendanceMutation.isPending}
                              >
                                A
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => markAttendance(record.student_id, record.course_id, 'late')}
                                disabled={markAttendanceMutation.isPending}
                              >
                                L
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {recordsLoading ? (
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
                        <TableHead>Total Classes</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead>Late</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSummary.map((summary) => (
                        <TableRow key={`${summary.student_id}-${summary.course_id}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{summary.student_name}</div>
                              <div className="text-sm text-text-secondary">{summary.student_email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {summary.course_name} ({summary.course_code})
                          </TableCell>
                          <TableCell>{summary.total_classes}</TableCell>
                          <TableCell className="text-green-600">{summary.present}</TableCell>
                          <TableCell className="text-red-600">{summary.absent}</TableCell>
                          <TableCell className="text-yellow-600">{summary.late}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${summary.percentage >= 80 ? 'text-green-600' : summary.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {summary.percentage}%
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${summary.percentage >= 80 ? 'bg-green-500' : summary.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${summary.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}