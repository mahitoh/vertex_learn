import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Users, 
  Clock, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  Calendar,
  User
} from "lucide-react";
import type { Course } from "@/types/academic";

interface CourseFormData {
  name: string;
  code: string;
  credits: number;
  instructor: string;
  instructorId: string;
  description: string;
  semester: string;
  year: number;
  maxStudents: number;
  schedule: {
    day: string;
    time: string;
    room: string;
  }[];
}

const initialFormData: CourseFormData = {
  name: "",
  code: "",
  credits: 3,
  instructor: "",
  instructorId: "",
  description: "",
  semester: "Fall",
  year: new Date().getFullYear(),
  maxStudents: 30,
  schedule: [{ day: "Monday", time: "09:00-10:30", room: "" }]
};

export default function CourseManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);

  const queryClient = useQueryClient();

  // Fetch courses
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/academic/courses"],
    queryFn: async () => {
      // Mock data for demonstration
      return [
        {
          id: "1",
          name: "Advanced Mathematics",
          code: "MATH301",
          credits: 4,
          instructor: "Dr. Sarah Johnson",
          instructorId: "inst1",
          description: "Advanced calculus and linear algebra concepts",
          semester: "Fall",
          year: 2024,
          maxStudents: 30,
          enrolledStudents: 25,
          schedule: [
            { day: "Monday", time: "09:00-10:30", room: "Room 101" },
            { day: "Wednesday", time: "09:00-10:30", room: "Room 101" }
          ],
          status: "active" as const,
          createdAt: "2024-01-15",
          updatedAt: "2024-01-15"
        },
        {
          id: "2",
          name: "Physics Laboratory",
          code: "PHYS201",
          credits: 3,
          instructor: "Prof. Michael Chen",
          instructorId: "inst2",
          description: "Hands-on physics experiments and analysis",
          semester: "Fall",
          year: 2024,
          maxStudents: 20,
          enrolledStudents: 18,
          schedule: [
            { day: "Tuesday", time: "14:00-17:00", room: "Lab 205" }
          ],
          status: "active" as const,
          createdAt: "2024-01-10",
          updatedAt: "2024-01-10"
        },
        {
          id: "3",
          name: "Computer Science Fundamentals",
          code: "CS101",
          credits: 3,
          instructor: "Dr. Emily Rodriguez",
          instructorId: "inst3",
          description: "Introduction to programming and computer science concepts",
          semester: "Spring",
          year: 2024,
          maxStudents: 35,
          enrolledStudents: 32,
          schedule: [
            { day: "Monday", time: "11:00-12:30", room: "Room 301" },
            { day: "Friday", time: "11:00-12:30", room: "Room 301" }
          ],
          status: "completed" as const,
          createdAt: "2024-01-05",
          updatedAt: "2024-05-15"
        }
      ];
    }
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: CourseFormData) => {
      // Mock API call
      const newCourse: Course = {
        id: Date.now().toString(),
        ...courseData,
        enrolledStudents: 0,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return newCourse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academic/courses"] });
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
    }
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CourseFormData> }) => {
      // Mock API call
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academic/courses"] });
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
    }
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      // Mock API call
      return courseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academic/courses"] });
    }
  });

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSemester = filterSemester === "all" || course.semester === filterSemester;
    const matchesStatus = filterStatus === "all" || course.status === filterStatus;
    
    return matchesSearch && matchesSemester && matchesStatus;
  });

  const handleCreateCourse = () => {
    createCourseMutation.mutate(formData);
  };

  const handleEditCourse = () => {
    if (selectedCourse) {
      updateCourseMutation.mutate({ id: selectedCourse.id, data: formData });
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      credits: course.credits,
      instructor: course.instructor,
      instructorId: course.instructorId,
      description: course.description,
      semester: course.semester,
      year: course.year,
      maxStudents: course.maxStudents,
      schedule: course.schedule
    });
    setIsEditDialogOpen(true);
  };

  const addScheduleSlot = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { day: "Monday", time: "09:00-10:30", room: "" }]
    }));
  };

  const removeScheduleSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const updateScheduleSlot = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const CourseForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Course Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter course name"
          />
        </div>
        <div>
          <Label htmlFor="code">Course Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            placeholder="e.g., CS101"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="credits">Credits</Label>
          <Input
            id="credits"
            type="number"
            value={formData.credits}
            onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
            min="1"
            max="6"
          />
        </div>
        <div>
          <Label htmlFor="semester">Semester</Label>
          <Select value={formData.semester} onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fall">Fall</SelectItem>
              <SelectItem value="Spring">Spring</SelectItem>
              <SelectItem value="Summer">Summer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
            min="2020"
            max="2030"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="instructor">Instructor</Label>
          <Input
            id="instructor"
            value={formData.instructor}
            onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
            placeholder="Instructor name"
          />
        </div>
        <div>
          <Label htmlFor="maxStudents">Max Students</Label>
          <Input
            id="maxStudents"
            type="number"
            value={formData.maxStudents}
            onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
            min="1"
            max="100"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Course description"
          rows={3}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <Label>Schedule</Label>
          <Button type="button" variant="outline" size="sm" onClick={addScheduleSlot}>
            <Plus className="h-4 w-4 mr-2" />
            Add Time Slot
          </Button>
        </div>
        <div className="space-y-3">
          {formData.schedule.map((slot, index) => (
            <div key={index} className="flex gap-3 items-end">
              <div className="flex-1">
                <Label>Day</Label>
                <Select value={slot.day} onValueChange={(value) => updateScheduleSlot(index, "day", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Time</Label>
                <Input
                  value={slot.time}
                  onChange={(e) => updateScheduleSlot(index, "time", e.target.value)}
                  placeholder="09:00-10:30"
                />
              </div>
              <div className="flex-1">
                <Label>Room</Label>
                <Input
                  value={slot.room}
                  onChange={(e) => updateScheduleSlot(index, "room", e.target.value)}
                  placeholder="Room number"
                />
              </div>
              {formData.schedule.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeScheduleSlot(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
          <p className="text-gray-600">Manage courses, schedules, and enrollments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>
              <CourseForm />
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCourse} disabled={createCourseMutation.isPending}>
                  {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterSemester} onValueChange={setFilterSemester}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <p className="text-sm text-gray-600">{course.code}</p>
                  </div>
                  <Badge className={getStatusColor(course.status)}>
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {course.credits} credits
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.enrolledStudents}/{course.maxStudents}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    {course.instructor}
                  </div>
                  {course.schedule.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {slot.day} {slot.time}
                      {slot.room && (
                        <>
                          <MapPin className="h-4 w-4 ml-2" />
                          {slot.room}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(course)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteCourse(course.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <CourseForm />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCourse} disabled={updateCourseMutation.isPending}>
              {updateCourseMutation.isPending ? "Updating..." : "Update Course"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}