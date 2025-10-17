import { useEffect, useState } from "react";

interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
}

export default function ProgressBar({
  current,
  total,
  color = "#3B82F6",
  height = 8,
  showPercentage = false,
  animated = true
}: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const percentage = Math.min((current / total) * 100, 100);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setProgress(percentage), 100);
      return () => clearTimeout(timer);
    } else {
      setProgress(percentage);
    }
  }, [percentage, animated]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Progression
        </span>
        {showPercentage && (
          <span className="text-sm font-bold" style={{ color }}>
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div
        className="w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 shadow-inner"
        style={{ height: `${height}px` }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}40`
          }}
        />
      </div>
    </div>
  );
}

