import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  type ChartOptions,
} from 'chart.js';
import { useTheme } from '@/contexts/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface DistributionChartProps {
  pending: number;
  inProgress: number;
  completed: number;
}

export function DistributionChart({ pending, inProgress, completed }: DistributionChartProps) {
  const { theme } = useTheme();
  const muted = theme === 'dark' ? '#94a3b8' : '#64748b';

  const data = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [pending, inProgress, completed],
        backgroundColor: ['#64748b', '#3380fc', '#10b981'],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: muted, padding: 16, usePointStyle: true, pointStyle: 'circle' },
      },
    },
    cutout: '65%',
  };

  return (
    <div className="h-64">
      <Doughnut data={data} options={options} />
    </div>
  );
}

interface WeeklyChartProps {
  data: number[];
  labels: string[];
}

export function WeeklyChart({ data, labels }: WeeklyChartProps) {
  const { theme } = useTheme();
  const muted = theme === 'dark' ? '#94a3b8' : '#64748b';
  const grid = theme === 'dark' ? '#334155' : '#e2e8f0';

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Completed Tasks',
        data,
        backgroundColor: '#3380fc',
        borderRadius: 8,
        maxBarThickness: 40,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: muted } },
      y: {
        beginAtZero: true,
        grid: { color: grid },
        ticks: { color: muted, precision: 0 },
      },
    },
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}
