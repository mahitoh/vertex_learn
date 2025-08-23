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
    <div className="bg-card-bg rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 min-h-[100px] flex items-center">
      <div className="flex items-center w-full">
        <div className={`p-2 sm:p-3 rounded-full ${color} flex-shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
          {isLoading ? (
            <>
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mb-2" />
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
            </>
          ) : (
            <>
              <p 
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary truncate"
                data-testid={`stat-value-${label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {value}
              </p>
              <p className="text-xs sm:text-sm text-text-secondary truncate">{label}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}