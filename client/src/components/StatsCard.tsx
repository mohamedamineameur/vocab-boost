import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  trend
}: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: bgColor }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {trend && (
          <div className={`text-sm font-semibold ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
      </div>
    </div>
  );
}
