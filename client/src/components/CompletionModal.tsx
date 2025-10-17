import { CheckCircle2, Trophy, Star, ArrowRight } from "lucide-react";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  total: number;
  timeSpent?: number;
  onContinue: () => void;
}

export default function CompletionModal({
  isOpen,
  onClose,
  score,
  total,
  timeSpent,
  onContinue
}: CompletionModalProps) {
  if (!isOpen) return null;

  const percentage = Math.round((score / total) * 100);
  const isPerfect = score === total;
  const isGreat = percentage >= 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slideUp">
        {/* Header */}
        <div className="text-center mb-6">
          {isPerfect ? (
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          ) : isGreat ? (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Star className="w-10 h-10 text-white" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          )}
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {isPerfect ? "Parfait ! 🎉" : isGreat ? "Excellent ! 🌟" : "Bien joué ! 👏"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {isPerfect 
              ? "Tu as tout réussi !" 
              : isGreat 
              ? "Continue comme ça !" 
              : "Tu progresses bien !"}
          </p>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-900 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-1">{score}/{total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Réponses correctes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-1">{percentage}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Score</div>
            </div>
          </div>
          
          {timeSpent && (
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Temps: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:bg-gray-900 transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={onContinue}
            className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Continuer <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

