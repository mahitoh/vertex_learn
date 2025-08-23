import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

interface InteractiveChartProps {
  title: string;
  data: ChartData;
  type: 'bar' | 'doughnut';
  filterOptions?: string[];
  onFilterChange?: (filter: string) => void;
  isLoading?: boolean;
}

export default function InteractiveChart({ 
  title, 
  data, 
  type, 
  filterOptions, 
  onFilterChange,
  isLoading = false 
}: InteractiveChartProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>(filterOptions?.[0] || 'all');

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    onFilterChange?.(value);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: (type === 'doughnut' ? 'right' : 'top') as 'top' | 'bottom' | 'left' | 'right',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            if (type === 'doughnut') {
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `Percentage: ${percentage}%`;
            }
            return '';
          }
        }
      }
    },
    scales: type === 'bar' ? {
      y: {
        beginAtZero: true,
      },
    } : undefined,
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
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
          <CardTitle>{title}</CardTitle>
          {filterOptions && (
            <Select value={selectedFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {type === 'bar' ? (
            <Bar data={data} options={chartOptions} />
          ) : (
            <Doughnut data={data} options={chartOptions} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}