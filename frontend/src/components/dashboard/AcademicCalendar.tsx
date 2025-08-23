import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Plus, List } from "lucide-react";
import type { CalendarEvent } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface AcademicCalendarProps {
  events: CalendarEvent[];
  isLoading?: boolean;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_OF_WEEK_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AcademicCalendar({ events, isLoading = false }: AcademicCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2023, 0, 1)); // January 2023
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Month');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startDate - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonth.getDate() - i)
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day)
      });
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day)
      });
    }
    
    return days;
  };

  const getEventForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.find(event => event.date === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date(2023, 0, 1)); // Reset to January 2023 as per design
  };

  if (isLoading) {
    return (
      <div className="bg-card-bg rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <Skeleton className="h-6 w-40 mb-4 sm:mb-6" />
        <Skeleton className="h-48 sm:h-64 w-full" />
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-card-bg rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-text-primary">Academic Calendar</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="p-2 text-text-secondary hover:bg-gray-100"
            data-testid="button-calendar-search"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button 
            size="sm"
            className="p-2 bg-primary text-white hover:bg-pink-600"
            data-testid="button-add-event"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-2 text-text-secondary hover:bg-gray-100"
            data-testid="button-calendar-list"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['Month', 'Week', 'Day'] as const).map((mode) => (
              <Button
                key={mode}
                variant="ghost"
                size="sm"
                className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium ${
                  viewMode === mode
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-gray-200'
                }`}
                onClick={() => setViewMode(mode)}
                data-testid={`button-view-${mode.toLowerCase()}`}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-text-secondary hover:bg-gray-100"
            onClick={() => navigateMonth('prev')}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm sm:text-lg font-semibold text-text-primary whitespace-nowrap">
            {MONTHS[currentDate.getMonth()]}, {currentDate.getFullYear()}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-text-secondary hover:bg-gray-100"
            onClick={() => navigateMonth('next')}
            data-testid="button-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-2 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm text-text-secondary hover:bg-gray-50"
            onClick={goToToday}
            data-testid="button-today"
          >
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Days of Week Header */}
        {DAYS_OF_WEEK.map((day, index) => (
          <div key={day} className="bg-card-bg p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-text-secondary">
            <span className="hidden sm:inline">{DAYS_OF_WEEK_FULL[index]}</span>
            <span className="sm:hidden">{day}</span>
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((dayData, index) => {
          const event = getEventForDate(dayData.date);
          return (
            <div 
              key={index} 
              className={`bg-card-bg p-1 sm:p-3 h-12 sm:h-16 relative ${
                !dayData.isCurrentMonth ? 'bg-gray-50' : ''
              }`}
              data-testid={`calendar-day-${dayData.day}`}
            >
              <span className={`text-xs sm:text-sm font-medium ${
                dayData.isCurrentMonth ? 'text-text-primary' : 'text-gray-400'
              }`}>
                {dayData.day}
              </span>
              {event && (
                <div 
                  className={`absolute bottom-0.5 sm:bottom-1 left-0.5 sm:left-1 right-0.5 sm:right-1 h-1 sm:h-2 rounded text-xs text-center overflow-hidden ${
                    event.type === 'holiday' 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-blue-200 text-blue-800'
                  }`}
                  title={event.title}
                  data-testid={`event-${event.id}`}
                >
                  <span className="text-xs hidden sm:inline truncate">{event.title}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}