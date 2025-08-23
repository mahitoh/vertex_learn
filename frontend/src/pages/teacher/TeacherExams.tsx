import DashboardLayout from "@/components/layouts/DashboardLayout";
import ExamCalendar from "@/components/teacher/ExamCalendar";

export default function TeacherExams() {
  return (
    <DashboardLayout>
      <ExamCalendar />
    </DashboardLayout>
  );
}