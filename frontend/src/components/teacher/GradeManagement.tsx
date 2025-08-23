import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Save, Edit } from 'lucide-react';
import { useToast } from '@/components/notifications/ToastProvider';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  grades: {
    subject: string;
    marks: number;
    maxMarks: number;
    grade: string;
  }[];
}

interface GradeManagementProps {
  isLoading?: boolean;
}

export default function GradeManagement({ isLoading = false }: GradeManagementProps) {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('mathematics');
  const [editingCell, setEditingCell] = useState<{ studentId: string; subject: string } | null>(null);

  // Mock data - in real app this would come from API
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      rollNumber: '2024001',
      class: 'Grade 12-A',
      grades: [
        { subject: 'mathematics', marks: 85, maxMarks: 100, grade: 'A' },
        { subject: 'physics', marks: 78, maxMarks: 100, grade: 'B+' },
        { subject: 'chemistry', marks: 92, maxMarks: 100, grade: 'A+' }
      ]
    },
    {
      id: '2',
      name: 'Bob Smith',
      rollNumber: '2024002',
      class: 'Grade 12-A',
      grades: [
        { subject: 'mathematics', marks: 72, maxMarks: 100, grade: 'B' },
        { subject: 'physics', marks: 68, maxMarks: 100, grade: 'B-' },
        { subject: 'chemistry', marks: 75, maxMarks: 100, grade: 'B+' }
      ]
    },
    {
      id: '3',
      name: 'Carol Davis',
      rollNumber: '2024003',
      class: 'Grade 12-B',
      grades: [
        { subject: 'mathematics', marks: 95, maxMarks: 100, grade: 'A+' },
        { subject: 'physics', marks: 88, maxMarks: 100, grade: 'A' },
        { subject: 'chemistry', marks: 90, maxMarks: 100, grade: 'A' }
      ]
    }
  ]);

  const classes = ['all', 'Grade 12-A', 'Grade 12-B', 'Grade 11-A', 'Grade 11-B'];
  const subjects = ['mathematics', 'physics', 'chemistry', 'biology', 'english'];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.includes(searchTerm);
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleGradeUpdate = (studentId: string, subject: string, newMarks: number) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          grades: student.grades.map(grade => {
            if (grade.subject === subject) {
              const percentage = (newMarks / grade.maxMarks) * 100;
              let newGrade = 'F';
              if (percentage >= 90) newGrade = 'A+';
              else if (percentage >= 80) newGrade = 'A';
              else if (percentage >= 70) newGrade = 'B+';
              else if (percentage >= 60) newGrade = 'B';
              else if (percentage >= 50) newGrade = 'C';
              else if (percentage >= 40) newGrade = 'D';
              
              return { ...grade, marks: newMarks, grade: newGrade };
            }
            return grade;
          })
        };
      }
      return student;
    }));
    
    setEditingCell(null);
    addToast({
      type: 'success',
      title: 'Grade Updated',
      description: `Successfully updated grade for ${students.find(s => s.id === studentId)?.name}`
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grade Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Edit className="w-5 h-5" />
          <span>Grade Management</span>
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls} value={cls}>
                  {cls === 'all' ? 'All Classes' : cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>
                  {subject.charAt(0).toUpperCase() + subject.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Student Name</th>
                <th className="text-left p-3 font-semibold">Roll Number</th>
                <th className="text-left p-3 font-semibold">Class</th>
                <th className="text-center p-3 font-semibold">Marks</th>
                <th className="text-center p-3 font-semibold">Grade</th>
                <th className="text-center p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const gradeData = student.grades.find(g => g.subject === selectedSubject);
                if (!gradeData) return null;
                
                return (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{student.name}</td>
                    <td className="p-3">{student.rollNumber}</td>
                    <td className="p-3">{student.class}</td>
                    <td className="p-3 text-center">
                      {editingCell?.studentId === student.id && editingCell?.subject === selectedSubject ? (
                        <Input
                          type="number"
                          defaultValue={gradeData.marks}
                          className="w-20 text-center"
                          min="0"
                          max={gradeData.maxMarks}
                          onBlur={(e) => {
                            const newMarks = parseInt(e.target.value) || 0;
                            if (newMarks !== gradeData.marks) {
                              handleGradeUpdate(student.id, selectedSubject, newMarks);
                            } else {
                              setEditingCell(null);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const newMarks = parseInt((e.target as HTMLInputElement).value) || 0;
                              handleGradeUpdate(student.id, selectedSubject, newMarks);
                            } else if (e.key === 'Escape') {
                              setEditingCell(null);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <span 
                          className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded"
                          onClick={() => setEditingCell({ studentId: student.id, subject: selectedSubject })}
                        >
                          {gradeData.marks}/{gradeData.maxMarks}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        gradeData.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                        gradeData.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                        gradeData.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {gradeData.grade}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCell({ studentId: student.id, subject: selectedSubject })}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No students found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}