import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { Button } from "@/components/ui/button";
import { RefreshCw, BarChart3, Download, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { GradeDistribution } from "@/types/dashboard";

Chart.register(...registerables);

interface GradeDistributionChartProps {
  gradeData: GradeDistribution;
  isLoading?: boolean;
}

export default function GradeDistributionChart({ gradeData, isLoading = false }: GradeDistributionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || isLoading) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Filter out grades with 0 values for cleaner display
    const filteredData = Object.entries(gradeData).filter(([_, value]) => value > 0);
    const labels = filteredData.map(([grade]) => grade);
    const data = filteredData.map(([_, value]) => value);

    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            '#3B82F6', // Blue for A
            '#10B981', // Green for B  
            '#EF4444', // Red for C
            '#F59E0B', // Yellow for D
            '#8B5CF6'  // Purple for F
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [gradeData, isLoading]);

  const gradeColors = {
    A: 'bg-blue-500',
    B: 'bg-green-500', 
    C: 'bg-red-500',
    D: 'bg-yellow-500',
    F: 'bg-purple-500'
  };

  if (isLoading) {
    return (
      <div className="bg-card-bg rounded-xl p-6 shadow-sm border border-gray-100">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-bg rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Absences (Current Month)</h3>
        <Button 
          variant="ghost"
          size="sm"
          className="text-accent-blue hover:text-blue-700"
          data-testid="button-regenerate-chart"
        >
          Regenerate
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 flex-wrap gap-1">
          <Button 
            variant="outline"
            size="sm"
            className="px-3 py-1 text-sm"
            data-testid="button-refresh-chart"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="px-3 py-1 text-sm"
            data-testid="button-insights-chart"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            Insights
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="px-3 py-1 text-sm"
            data-testid="button-download-chart"
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="px-3 py-1 text-sm"
            data-testid="button-chart-analytics"
          >
            <TrendingUp className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="px-3 py-1 text-sm"
            data-testid="button-sort-chart"
          >
            Sort
          </Button>
        </div>
      </div>

      <div className="relative h-64 mb-4">
        <canvas ref={chartRef} className="w-full h-full" data-testid="grade-distribution-chart" />
      </div>

      <div className="flex flex-col space-y-2">
        {Object.entries(gradeData).map(([grade, percentage]) => (
          <div key={grade} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 ${gradeColors[grade as keyof typeof gradeColors]} rounded-full`}></div>
              <span className="text-sm text-text-secondary">{grade}</span>
            </div>
            <span 
              className="text-sm font-medium text-text-primary"
              data-testid={`grade-percentage-${grade.toLowerCase()}`}
            >
              {percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
