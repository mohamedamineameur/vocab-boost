import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";

interface QuizCardProps {
  question: string;
  options: string[];
  correctAnswer: string;
  onAnswer: (isCorrect: boolean) => void;
  feedback?: string;
}

export default function QuizCard({
  question,
  options,
  correctAnswer,
  onAnswer,
  feedback
}: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSelect = (option: string) => {
    if (showFeedback) return;
    
    setSelected(option);
    const correct = option === correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  };

  const reset = () => {
    setSelected(null);
    setShowFeedback(false);
    setIsCorrect(null);
  };

  useEffect(() => {
    reset();
  }, [question]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
      {/* Question */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Question</h2>
        </div>
        <p className="text-xl text-gray-700 dark:text-gray-300">{question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelectedOption = selected === option;
          const isCorrectOption = option === correctAnswer;
          let buttonClass = `
            w-full p-4 rounded-2xl text-left font-medium
            transition-all duration-300 transform
            ${!showFeedback ? "hover:scale-[1.02] active:scale-[0.98] bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700" : ""}
          `;

          if (showFeedback) {
            if (isCorrectOption) {
              buttonClass += " bg-green-100 border-2 border-green-500 text-green-900";
            } else if (isSelectedOption && !isCorrectOption) {
              buttonClass += " bg-red-100 border-2 border-red-500 text-red-900";
            } else {
              buttonClass += " bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              disabled={showFeedback}
              className={buttonClass}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showFeedback && isSelectedOption && (
                  <div className="ml-3">
                    {isCorrectOption ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && feedback && (
        <div className={`mt-6 p-4 rounded-2xl ${isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          <p className="font-medium">{feedback}</p>
        </div>
      )}
    </div>
  );
}

