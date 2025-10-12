import React, { useState, useEffect, useRef } from "react";
import { Volume2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { getAudio } from "../../services/audio.services";

interface SpellingComponentProps {
  questionId: string;
  audioText: string; // Le texte à faire lire par TTS
  correctAnswer: string;
  fetchAnswer: (id: string, isCorrect: boolean) => Promise<unknown>;
}

const tr = {
  fr: {
    typeWord: "Tapez ce que vous entendez",
    placeholder: "Votre réponse...",
    listen: "Écouter",
    check: "Vérifier",
    tryAgain: "Réessayer",
    correct: "Correct !",
    incorrect: "Incorrect. La bonne réponse était :",
    listening: "Lecture en cours...",
  },
  en: {
    typeWord: "Type what you hear",
    placeholder: "Your answer...",
    listen: "Listen",
    check: "Check",
    tryAgain: "Try again",
    correct: "Correct!",
    incorrect: "Incorrect. The correct answer was:",
    listening: "Playing...",
  },
  ar: {
    typeWord: "اكتب ما تسمعه",
    placeholder: "إجابتك...",
    listen: "استمع",
    check: "تحقق",
    tryAgain: "حاول مرة أخرى",
    correct: "صحيح!",
    incorrect: "خطأ. الإجابة الصحيحة كانت:",
    listening: "جارٍ التشغيل...",
  },
  es: {
    typeWord: "Escribe lo que escuchas",
    placeholder: "Tu respuesta...",
    listen: "Escuchar",
    check: "Verificar",
    tryAgain: "Intentar de nuevo",
    correct: "¡Correcto!",
    incorrect: "Incorrecto. La respuesta correcta era:",
    listening: "Reproduciendo...",
  },
} as const;

export default function SpellingComponent({
  questionId,
  audioText,
  correctAnswer,
  fetchAnswer,
}: SpellingComponentProps) {
  const { language } = useTranslate();
  const t = (key: keyof typeof tr["fr"]) =>
    (tr as Record<string, Record<string, string>>)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Charger l'audio depuis l'API au montage
  useEffect(() => {
    let mounted = true;

    const loadAudio = async () => {
      setLoadingAudio(true);
      try {
        const url = await getAudio(audioText);
        if (mounted) {
          setAudioUrl(url);
          setLoadingAudio(false);
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'audio:", err);
        if (mounted) {
          setLoadingAudio(false);
        }
      }
    };

    loadAudio();

    return () => {
      mounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrl) {
        try {
          URL.revokeObjectURL(audioUrl);
        } catch {
          console.error("Erreur lors de la revocation de l'URL de l'audio");
        }
      }
    };
  }, [audioText]);

  // Fonction pour jouer l'audio depuis l'API
  const playAudio = () => {
    if (!audioUrl || isPlaying) return;

    setIsPlaying(true);
    
    // Arrêter l'audio en cours
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    
    audio.play();
  };

  // Jouer automatiquement quand l'audio est chargé
  useEffect(() => {
    if (audioUrl && !loadingAudio) {
      playAudio();
    }
  }, [audioUrl, loadingAudio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitted || !userInput.trim()) return;

    // Normaliser les deux chaînes pour la comparaison (ignorer casse et espaces)
    const normalized = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");
    const correct = normalized(userInput) === normalized(correctAnswer);

    setIsCorrect(correct);
    setSubmitted(true);

    await fetchAnswer(questionId, correct);
  };

  const handleReset = () => {
    setUserInput("");
    setSubmitted(false);
    setIsCorrect(null);
    playAudio();
  };

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-[#111827] mb-4">
          {t("typeWord")}
        </h3>
        
        <button
          type="button"
          onClick={playAudio}
          disabled={isPlaying || loadingAudio || !audioUrl}
          className={[
            "inline-flex items-center gap-2 px-6 py-3 rounded-2xl shadow-md transition",
            (isPlaying || loadingAudio || !audioUrl)
              ? "bg-[#3B82F6]/60 text-white cursor-not-allowed"
              : "bg-[#3B82F6] text-white hover:scale-105 active:scale-95",
          ].join(" ")}
        >
          {loadingAudio ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Chargement...
            </>
          ) : isPlaying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("listening")}
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              {t("listen")}
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={submitted}
          placeholder={t("placeholder")}
          className="w-full px-4 py-3 rounded-2xl border border-[#F3F4F6] bg-white text-[#111827] text-center text-lg focus:ring-2 focus:ring-[#3B82F6] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          autoFocus
        />

        {!submitted ? (
          <button
            type="submit"
            disabled={!userInput.trim()}
            className={[
              "w-full py-3 px-6 rounded-2xl shadow-md text-white transition",
              userInput.trim()
                ? "bg-[#22C55E] hover:scale-105 active:scale-95"
                : "bg-[#22C55E]/60 cursor-not-allowed",
            ].join(" ")}
          >
            {t("check")}
          </button>
        ) : (
          <div className="space-y-4">
            {isCorrect ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-100 text-green-700 border border-green-200">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <span className="font-semibold">{t("correct")}</span>
              </div>
            ) : (
              <div className="space-y-2 p-4 rounded-2xl bg-red-100 text-red-700 border border-red-200">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 shrink-0" />
                  <span className="font-semibold">{t("incorrect")}</span>
                </div>
                <div className="text-center mt-2">
                  <span className="font-bold text-lg text-[#111827]">
                    {correctAnswer}
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 px-6 rounded-2xl shadow-md bg-[#3B82F6] text-white hover:scale-105 active:scale-95 transition"
            >
              {t("tryAgain")}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}


