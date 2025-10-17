import { Flame } from "lucide-react";

interface StreakDisplayProps {
  streak: number;
  size?: "sm" | "md" | "lg";
}

export default function StreakDisplay({ streak, size = "md" }: StreakDisplayProps) {
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full shadow-lg px-4 py-2 animate-pulse">
      <Flame className={`${iconSizes[size]} animate-bounce`} />
      <span className="font-bold">{streak}</span>
      <span className="text-sm opacity-90">jours 🔥</span>
    </div>
  );
}

