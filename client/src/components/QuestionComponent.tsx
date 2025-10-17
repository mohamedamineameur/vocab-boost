import { useState } from "react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function QuestionComponent({
  question,
  fetchAnswer,
}: {
  question: Question;
  fetchAnswer: (id: string, isCorrect: boolean) => Promise<string>;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleOptionChange = async (option: string) => {
    if (selectedOption) return; // empêcher de changer après sélection
    setSelectedOption(option);

    // comparaison tolérante (évite souci espaces/majuscules)
    const correct =
      option.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    setIsCorrect(correct);

    try {
      await fetchAnswer(question.id, correct); // on n'affiche rien, juste l'appel
    } catch {
      // pas d'UI d'erreur demandée
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-[#F3F4F6] p-5">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">
          {question.question}
        </h2>

        <div
          className="grid grid-cols-1 gap-3"
          role="radiogroup"
          aria-label="Choix de réponse"
        >
          {question.options.map((opt) => {
            const isSelected = selectedOption === opt;
            const good = isSelected && isCorrect === true;
            const bad = isSelected && isCorrect === false;

            return (
              <button
                key={opt}
                type="button" // ✅ évite le submit de formulaire
                role="radio"
                aria-checked={isSelected}
                disabled={!!selectedOption}
                onClick={() => handleOptionChange(opt)}
                className={[
                  "w-full text-left py-3 px-4 rounded-2xl border shadow-md",
                  "transition hover:scale-105 active:scale-95",
                  "focus:outline-none focus:ring-4 focus:ring-blue-400/30",
                  "bg-white dark:bg-gray-800 text-[#111827] border-[#F3F4F6]",
                  good ? "bg-green-50 border-green-600" : "",
                  bad ? "bg-red-50 border-red-600" : "",
                  selectedOption && !isSelected ? "opacity-60" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
