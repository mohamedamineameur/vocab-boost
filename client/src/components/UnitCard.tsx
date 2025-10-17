import { CheckCircle2, Lock, Play } from "lucide-react";

interface UnitCardProps {
  title: string;
  description: string;
  progress: number; // 0-100
  totalWords: number;
  completedWords: number;
  isLocked: boolean;
  isActive: boolean;
  onClick: () => void;
  color?: string;
}

export default function UnitCard({
  title,
  description,
  progress,
  totalWords,
  completedWords,
  isLocked,
  isActive,
  onClick,
  color = "#3B82F6"
}: UnitCardProps) {
  const isCompleted = progress === 100;

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`
        group relative w-full text-left p-6 rounded-3xl shadow-lg
        transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
        ${isLocked ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800 hover:shadow-xl"}
        ${isActive ? "ring-4 ring-blue-200" : ""}
      `}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-600 rounded-t-3xl overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: color
          }}
        />
      </div>

      {/* Content */}
      <div className="mt-2">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
          </div>
          
          {/* Icon */}
          <div className={`
            ml-4 w-12 h-12 rounded-full flex items-center justify-center
            transition-transform group-hover:scale-110
            ${isCompleted ? "bg-green-100" : isLocked ? "bg-gray-200 dark:bg-gray-600" : "bg-blue-100"}
          `}>
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : isLocked ? (
              <Lock className="w-6 h-6 text-gray-400" />
            ) : (
              <Play className="w-6 h-6 text-blue-600" />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-300">
              {completedWords}/{totalWords} mots
            </span>
          </div>
          <div className="text-gray-400">•</div>
          <span className="text-gray-600 dark:text-gray-300">
            {Math.round(progress)}% complété
          </span>
        </div>
      </div>

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Verrouillé</p>
          </div>
        </div>
      )}
    </button>
  );
}

