import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/components/notifications/ToastProvider';

interface ExamEvent {
  id: string;
  title: string;
  subject: string;
  class: string;
  date: string;
  time: string;
  duration: string;
  room: string;
  type: 'midterm' | 'final' | 'quiz' | 'practical';
}

interface ExamCalendarProps {
  isLoading?: boolean;
}

export default function ExamCalendar({ isLoading = false }: ExamCalendarProps) {
  const { addToast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const [exams, setExams] = useState<ExamEvent[]>([
    {
      id: '1',
      title: 'Mathematics Midterm',
      subject: 'Mathematics',
      class: 'Grade 12-A',
      date: '2024-12-15',
      time: '09:00',
      duration: '2 hours',
      room: 'Room 101',
      type: 'midterm'
    },
    {
      id: '2',
      title: 'Physics Final Exam',
      subject: 'Physics',
      class: 'Grade 12-A',
      date: '2024-12-20',
      time: '10:00',
      duration: '3 hours',
      room: 'Lab 201',
      type: 'final'
    },
    {
      id: '3',
      title: 'Chemistry Lab Test',
      subject: 'Chemistry',
      class: 'Grade 12-B',
      date: '2024-12-18',
      time: '14:00',
      duration: '1.5 hours',
      room: 'Lab 301',
      type: 'practical'
    }
  ]);

  const [newExam, setNewExam] = useState<Partial<ExamEvent>>({
    title: '',
    subject: '',
    class: '',
    date: '',
    time: '',
    duration: '',
    room: '',
    type: 'midterm'
  });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];
  const classes = ['Grade 12-A', 'Grade 12-B', 'Grade 11-A', 'Grade 11-B'];
  const examTypes = ['midterm', 'final', 'quiz', 'practical'];

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate()
      });
    }
    return weekDates;
  };

  const weekDates = getCurrentWeekDates();

  const getExamsForDate = (date: string) => {
    return exams.filter(exam => exam.date === date);
  };

  const handleAddExam = () => {
    if (!newExam.title || !newExam.subject || !newExam.class || !newExam.date || !newExam.time) {
      addToast({
        type: 'error',
        title: 'Missing Information',
        description: 'Please fill in all required fields.'
      });
      return;
    }

    const exam: ExamEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newExam.title!,
      subject: newExam.subject!,
      class: newExam.class!,
      date: newExam.date!,
      time: newExam.time!,
      duration: newExam.duration || '1 hour',
      room: newExam.room || 'TBD',
      type: newExam.type as ExamEvent['type'] || 'midterm'
    };

    setExams(prev => [...prev, exam]);
    setNewExam({
      title: '',
      subject: '',
      class: '',
      date: '',
      time: '',
      duration: '',
      room: '',
      type: 'midterm'
    });
    setDialogOpen(false);
    
    addToast({
      type: 'success',
      title: 'Exam Scheduled',
      description: `${exam.title} has been added to the calendar.`
    });
  };

  const getExamTypeColor = (type: ExamEvent['type']) => {
    switch (type) {
      case 'final': return 'bg-red-100 text-red-800 border-red-200';
      case 'midterm': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'quiz': return 'bg-green-100 text-green-800 border-green-200';
      case 'practical': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exam Calendar</CardTitle>
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Exam Calendar</span>
          </CardTitle>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-pink-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Exam</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    value={newExam.title}
                    onChange={(e) => setNewExam(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Mathematics Midterm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={newExam.subject} onValueChange={(value) => setNewExam(prev => ({ ...prev, subject: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Select value={newExam.class} onValueChange={(value) => setNewExam(prev => ({ ...prev, class: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(cls => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newExam.date}
                      onChange={(e) => setNewExam(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newExam.time}
                      onChange={(e) => setNewExam(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={newExam.duration}
                      onChange={(e) => setNewExam(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 2 hours"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="room">Room</Label>
                    <Input
                      id="room"
                      value={newExam.room}
                      onChange={(e) => setNewExam(prev => ({ ...prev, room: e.target.value }))}
                      placeholder="e.g., Room 101"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="type">Exam Type</Label>
                  <Select value={newExam.type} onValueChange={(value) => setNewExam(prev => ({ ...prev, type: value as ExamEvent['type'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddExam} className="bg-primary hover:bg-pink-600">
                    Schedule Exam
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Weekly Calendar View */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDates.map(({ date, day, dayNumber }) => {
            const dayExams = getExamsForDate(date);
            const isToday = date === new Date().toISOString().split('T')[0];
            
            return (
              <div
                key={date}
                className={`p-3 border rounded-lg min-h-[120px] ${
                  isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="font-medium text-center mb-2">
                  <div className="text-xs text-gray-600">{day}</div>
                  <div className={`text-lg ${isToday ? 'text-blue-600' : ''}`}>{dayNumber}</div>
                </div>
                
                <div className="space-y-1">
                  {dayExams.map(exam => (
                    <div
                      key={exam.id}
                      className={`text-xs p-1 rounded border ${getExamTypeColor(exam.type)}`}
                      title={`${exam.title} - ${exam.time} - ${exam.room}`}
                    >
                      <div className="font-medium truncate">{exam.subject}</div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{exam.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Upcoming Exams List */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Upcoming Exams</h3>
          <div className="space-y-2">
            {exams
              .filter(exam => new Date(exam.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map(exam => (
                <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{exam.title}</div>
                    <div className="text-sm text-gray-600">
                      {exam.class} • {exam.subject}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(exam.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {exam.time}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {exam.room}
                    </div>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${getExamTypeColor(exam.type)}`}>
                      {exam.type}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}