import { Button } from "@/components/ui/button";
import { useUser, type UserRole } from "@/contexts/UserContext";
import { useToast } from "@/components/notifications/ToastProvider";

export default function RoleSwitcher() {
  const { user, setUser } = useUser();
  const { addToast } = useToast();

  const switchRole = (newRole: UserRole) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      role: newRole,
      ...(newRole === 'teacher' ? {
        teacherId: 'T001',
        department: 'Mathematics'
      } : {
        studentId: '2024001',
        class: 'Grade 12 - Science'
      })
    };

    setUser(updatedUser);
    addToast({
      type: 'info',
      title: 'Role Switched',
      description: `Switched to ${newRole} view`,
      duration: 3000
    });
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border">
      <div className="text-xs text-gray-600 mb-2">Demo: Switch Role</div>
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant={user.role === 'student' ? 'default' : 'outline'}
          onClick={() => switchRole('student')}
          className="text-xs"
        >
          Student
        </Button>
        <Button
          size="sm"
          variant={user.role === 'teacher' ? 'default' : 'outline'}
          onClick={() => switchRole('teacher')}
          className="text-xs"
        >
          Teacher
        </Button>
      </div>
    </div>
  );
}