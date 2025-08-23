import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Schedule() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-6">My Schedule</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Mathematics</h3>
                    <p className="text-sm text-gray-600">Room 201</p>
                  </div>
                  <span className="text-sm font-medium">9:00 AM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Physics</h3>
                    <p className="text-sm text-gray-600">Lab 101</p>
                  </div>
                  <span className="text-sm font-medium">11:00 AM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Chemistry</h3>
                    <p className="text-sm text-gray-600">Lab 202</p>
                  </div>
                  <span className="text-sm font-medium">2:00 PM</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Mathematics Final</h3>
                    <p className="text-sm text-gray-600">Chapter 1-10</p>
                  </div>
                  <span className="text-sm font-medium">Dec 15</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Physics Midterm</h3>
                    <p className="text-sm text-gray-600">Units 1-5</p>
                  </div>
                  <span className="text-sm font-medium">Dec 20</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}