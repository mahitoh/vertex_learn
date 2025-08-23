import { UserPlus, UserCheck, Calendar, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ActionButton {
  icon: React.ElementType;
  label: string;
  color: string;
  onClick: () => void;
  testId: string;
}

export default function ActionButtons() {
  const { toast } = useToast();

  const handleAddStudent = () => {
    toast({
      title: "Add Student",
      description: "Add student functionality will be implemented",
    });
  };

  const handleAddEmployee = () => {
    toast({
      title: "Add Employee",
      description: "Add employee functionality will be implemented",
    });
  };

  const handlePlanCalendar = () => {
    toast({
      title: "Plan Academic Calendar",
      description: "Calendar planning functionality will be implemented",
    });
  };

  const handleSendAnnouncement = () => {
    toast({
      title: "Send Announcement",
      description: "Announcement functionality will be implemented",
    });
  };

  const actions: ActionButton[] = [
    {
      icon: UserPlus,
      label: "Add Student",
      color: "bg-blue-100 group-hover:bg-blue-200 text-blue-600",
      onClick: handleAddStudent,
      testId: "button-add-student",
    },
    {
      icon: UserCheck,
      label: "Add Employee",
      color: "bg-green-100 group-hover:bg-green-200 text-green-600",
      onClick: handleAddEmployee,
      testId: "button-add-employee",
    },
    {
      icon: Calendar,
      label: "Plan Academic Calendar",
      color: "bg-purple-100 group-hover:bg-purple-200 text-purple-600",
      onClick: handlePlanCalendar,
      testId: "button-plan-calendar",
    },
    {
      icon: Megaphone,
      label: "Send Announcement",
      color: "bg-orange-100 group-hover:bg-orange-200 text-orange-600",
      onClick: handleSendAnnouncement,
      testId: "button-send-announcement",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {actions.map((action) => (
        <Button
          key={action.testId}
          variant="ghost"
          className="bg-card-bg rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group text-center h-auto flex-col space-y-2 sm:space-y-3 min-h-[80px] sm:min-h-[100px]"
          onClick={action.onClick}
          data-testid={action.testId}
        >
          <div
            className={`p-2 sm:p-3 rounded-full transition-colors mx-auto w-fit ${action.color}`}
          >
            <action.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-text-primary leading-tight">
            {action.label}
          </p>
        </Button>
      ))}
    </div>
  );
}
