import { useState } from "react";
import { Volume2, CheckCircle2 } from "lucide-react";

interface WordCardProps {
  word: string;
  translation: string;
  example?: string;
  exampleTranslation?: string;
  onSelect?: () => void;
  isSelected?: boolean;
  size?: "sm" | "md" | "lg";
  showExample?: boolean;
}

export default function WordCard({
  word,
  translation,
  example,
  exampleTranslation,
  onSelect,
  isSelected = false,
  size = "md",
  showExample = true
}: WordCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const sizeClasses = {
    sm: "p-4 text-base",
    md: "p-6 text-lg",
    lg: "p-8 text-xl"
  };

  const handlePlayAudio = () => {
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  };

  return (
    <div
      onClick={onSelect}
      className={`
        relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden
        transition-all duration-300 cursor-pointer
        ${isSelected ? "ring-4 ring-blue-500 shadow-2xl scale-105" : "hover:shadow-xl hover:scale-[1.02]"}
        ${sizeClasses[size]}
      `}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="text-center">
        {/* Word */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2 className="font-bold text-gray-900 dark:text-gray-100">{word}</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayAudio();
            }}
            className={`
              p-2 rounded-full transition-colors
              ${isPlaying ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600"}
            `}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Translation */}
        <p className="text-gray-600 dark:text-gray-300 font-medium mb-3">{translation}</p>

        {/* Example */}
        {showExample && example && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm italic text-gray-500 mb-1">{example}</p>
            {exampleTranslation && (
              <p className="text-sm text-gray-400">{exampleTranslation}</p>
            )}
          </div>
        )}
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 hover:from-blue-500/5 hover:to-blue-500/10 transition-opacity pointer-events-none rounded-3xl" />
    </div>
  );
}

