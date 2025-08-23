import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  color: string;
  isLoading?: boolean;
}

export default function StatsCard({ 
  icon: Icon, 
  value, 
  label, 
  color, 
  isLoading = false 
}: StatsCardProps) {
  return (
    <div className="bg-card-bg rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-20" />
            </>
          ) : (
            <>
              <p 
                className="text-3xl font-bold text-text-primary"
                data-testid={`stat-value-${label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {value}
              </p>
              <p className="text-sm text-text-secondary">{label}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
