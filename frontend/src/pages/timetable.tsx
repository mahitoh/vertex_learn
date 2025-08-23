import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Timetable() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '1:00-2:00', '2:00-3:00'];

  const schedule = {
    'Monday': ['Math', 'Physics', 'Chemistry', 'Lunch', 'English', 'History'],
    'Tuesday': ['English', 'Math', 'Biology', 'Lunch', 'Physics', 'Chemistry'],
    'Wednesday': ['History', 'Chemistry', 'Math', 'Lunch', 'Biology', 'English'],
    'Thursday': ['Physics', 'Biology', 'English', 'Lunch', 'Math', 'History'],
    'Friday': ['Chemistry', 'History', 'Physics', 'Lunch', 'Biology', 'Math']
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Weekly Timetable</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Class Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-3 bg-gray-50">Time</th>
                    {days.map(day => (
                      <th key={day} className="border p-3 bg-gray-50">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, index) => (
                    <tr key={time}>
                      <td className="border p-3 font-medium bg-gray-50">{time}</td>
                      {days.map(day => {
                        const subject = schedule[day as keyof typeof schedule][index];
                        const isLunch = subject === 'Lunch';
                        return (
                          <td 
                            key={`${day}-${time}`} 
                            className={`border p-3 text-center ${
                              isLunch 
                                ? 'bg-yellow-50 text-yellow-800' 
                                : 'bg-blue-50 text-blue-800'
                            }`}
                          >
                            {subject}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}