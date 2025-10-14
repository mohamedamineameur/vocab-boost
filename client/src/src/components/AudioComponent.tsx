import { useEffect, useRef, useState } from "react";
import { Play, Pause, CheckCircle2, XCircle } from "lucide-react";
import { getAudio } from "../../services/audio.services";
import { useTranslate } from "../contexts/TranslateContext";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

type Props = {
  question: Question;
  fetchAnswer: (id: string, isCorrect: boolean) => Promise<string>;
};

/* 🌍 Traductions locales */
const tr = {
  fr: {
    loadingAudios: "Chargement de la question",
    ariaGroup: "Choix de réponse",
    option: "Option",
    validate: "Valider",
    validating: "Validation...",
    correct: "Bonne réponse !",
    incorrect: "Mauvaise réponse.",
    selectPrompt: "Sélectionne une option pour activer le bouton Valider.",
    instruction: "Touchez une carte pour écouter et sélectionner.",
    playLabel: "Lire l’option",
    pauseLabel: "Mettre en pause",
  },
  en: {
    loadingAudios: "Loading the question",
    ariaGroup: "Answer choices",
    option: "Option",
    validate: "Validate",
    validating: "Validating...",
    correct: "Correct answer!",
    incorrect: "Incorrect answer.",
    selectPrompt: "Select an option to enable Validate.",
    instruction: "Tap a card to listen and select.",
    playLabel: "Play option",
    pauseLabel: "Pause",
  },
  ar: {
    loadingAudios: "جارٍ تحميل السؤال...",
    ariaGroup: "خيارات الإجابة",
    option: "خيار",
    validate: "تحقّق",
    validating: "جارٍ التحقق...",
    correct: "إجابة صحيحة!",
    incorrect: "إجابة خاطئة.",
    selectPrompt: "اختر خيارًا لتفعيل زر التحقق.",
    instruction: "اضغط على البطاقة للاستماع والاختيار.",
    playLabel: "تشغيل الخيار",
    pauseLabel: "إيقاف مؤقت",
  },
  es: {
    loadingAudios: "Cargando la pregunta...",
    ariaGroup: "Opciones de respuesta",
    option: "Opción",
    validate: "Validar",
    validating: "Validando...",
    correct: "¡Respuesta correcta!",
    incorrect: "Respuesta incorrecta.",
    selectPrompt: "Selecciona una opción para habilitar Validar.",
    instruction: "Toca una tarjeta para escuchar y seleccionar.",
    playLabel: "Reproducir opción",
    pauseLabel: "Pausa",
  },
} as const;

export default function TTSQuestionComponent({ question, fetchAnswer }: Props) {
  const { language } = useTranslate();
  type Keys = keyof typeof tr.fr;
  const t = (key: Keys) => (tr as Record<string, Record<string, string>>)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hasValidated, setHasValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Charger tous les audios au montage / quand la question change
  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      setLoading(true);
      const urls: Record<string, string> = {};
      for (let i = 0; i < question.options.length; i++) {
        try {
          const url = await getAudio(question.options[i]);
          if (url) {
            urls[String(i)] = url;
          }
        } catch (err) {
          // Erreur audio silencieuse
        }
      }
      if (mounted) {
        setAudioUrls(urls);
        setLoading(false);
      }
    };

    // reset état
    setSelectedOption(null);
    setIsCorrect(null);
    setHasValidated(false);
    setSubmitting(false);
    setSpeakingId(null);
    audioRef.current?.pause();

    loadAll();

    return () => {
      mounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Nettoyage des blobs
      Object.values(audioUrls).forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  // Lecture
  const playAudio = (id: string) => {
    // stop si on reclique la même
    if (speakingId === id) {
      audioRef.current?.pause();
      setSpeakingId(null);
      return;
    }

    if (!audioUrls[id]) return;

    // stop en cours
    audioRef.current?.pause();

    const audio = new Audio(audioUrls[id]);
    audioRef.current = audio;

    setSpeakingId(id);
    audio.onended = () => setSpeakingId(null);
    audio.onerror = () => setSpeakingId(null);
    audio.play();
  };

  // Validation
  const handleValidate = async () => {
    if (!selectedOption || hasValidated) return;

    const correct =
      selectedOption.trim().toLowerCase() ===
      question.correctAnswer.trim().toLowerCase();

    setIsCorrect(correct);
    setHasValidated(true);

    try {
      setSubmitting(true);
      await fetchAnswer(question.id, correct);
    } finally {
      setSubmitting(false);
    }
  };

  // --- UI ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <div className="w-16 h-16 border-4 border-t-[#3B82F6] border-gray-300 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-semibold text-[#3B82F6]">
          {t("loadingAudios")}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl shadow-2xl border border-[#F3F4F6] p-5">
        {/* Question */}
        <h2 className="text-lg md:text-xl font-semibold text-[#111827] mb-1">
          {question.question}
        </h2>
        <p className="text-sm text-[#111827]/70 mb-4">{t("instruction")}</p>

        {/* Options */}
        <div
          role="radiogroup"
          aria-label={t("ariaGroup")}
          className={`grid grid-cols-1 gap-3 ${isRTL ? "text-right" : "text-left"}`}
        >
          {question.options.map((opt, idx) => {
            const id = String(idx);
            const isSelected = selectedOption === opt;
            const showGood = hasValidated && isSelected && isCorrect === true;
            const showBad = hasValidated && isSelected && isCorrect === false;
            const revealCorrect =
              hasValidated &&
              isCorrect === false &&
              opt.trim().toLowerCase() ===
                question.correctAnswer.trim().toLowerCase();

            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => {
                  if (!hasValidated) setSelectedOption(opt);
                  playAudio(id); // joue l'audio dès que l'on clique sur la carte
                }}
                className={[
                  "w-full flex items-center gap-3 py-3 px-4 rounded-2xl border shadow-md",
                  "transition hover:scale-105 active:scale-95",
                  "focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/30",
                  "bg-white text-[#111827] border-[#F3F4F6]",
                  isSelected && !hasValidated
                    ? "ring-2 ring-[#3B82F6]/40 border-[#3B82F6]"
                    : "",
                  showGood ? "bg-green-50 border-green-600" : "",
                  showBad ? "bg-red-50 border-red-600" : "",
                  revealCorrect ? "bg-green-50/60 border-green-500" : "",
                  hasValidated && !isSelected && !revealCorrect ? "opacity-60" : "",
                ].join(" ")}
              >
                {/* Bouton TTS visuel */}
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#3B82F6] text-white shrink-0"
                  aria-label={speakingId === id ? t("pauseLabel") : t("playLabel")}
                >
                  {speakingId === id ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </span>

                {/* Texte */}
                <div className="flex-1">
                  <div className="font-semibold">
                    {t("option")} {String.fromCharCode(65 + idx)}
                  </div>
                </div>

                {/* Icônes */}
                {showGood && <CheckCircle2 className="w-6 h-6 text-[#22C55E]" aria-hidden="true" />}
                {showBad && <XCircle className="w-6 h-6 text-red-600" aria-hidden="true" />}
                {revealCorrect && !showGood && (
                  <CheckCircle2 className="w-6 h-6 text-[#22C55E]" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {/* Validation */}
        <div className="mt-5">
          {!hasValidated ? (
            <>
              <button
                type="button"
                onClick={handleValidate}
                disabled={!selectedOption || submitting}
                className={[
                  "w-full py-3 px-6 rounded-2xl shadow-md text-white text-lg",
                  "transition hover:scale-105 active:scale-95",
                  !selectedOption || submitting
                    ? "bg-[#3B82F6]/60 cursor-not-allowed"
                    : "bg-[#3B82F6]",
                ].join(" ")}
              >
                {submitting ? t("validating") : t("validate")}
              </button>
              {!selectedOption && (
                <p className="text-sm text-[#111827]/70 mt-2">{t("selectPrompt")}</p>
              )}
            </>
          ) : (
            <div
              className={[
                "w-full py-3 px-4 rounded-2xl border shadow-md flex items-center gap-2",
                isCorrect ? "bg-green-50 border-green-600" : "bg-red-50 border-red-600",
              ].join(" ")}
              role="status"
              aria-live="polite"
            >
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="text-[#111827] font-medium">
                {isCorrect ? t("correct") : t("incorrect")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
