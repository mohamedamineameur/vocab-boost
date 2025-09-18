import React, { useMemo, useState } from "react";
import { RotateCcw, Shuffle, StepForward, Globe2, CheckCircle2 } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext"; // ⚠️ ajuste le chemin si besoin
import SentenceArrangeComponent from "../components/SentenceArrangeComponent"; // ⚠️ ajuste le chemin si besoin

// ————————————————————————————————————————————————————————
// Données de démo (phrases à réarranger)
// ————————————————————————————————————————————————————————
const samples: Record<string, { id: string; sentence: string }[]> = {
  en: [
    { id: "en-1", sentence: "I am learning English every day." },
    { id: "en-2", sentence: "She drinks a cup of coffee in the morning." },
    { id: "en-3", sentence: "They will visit London next summer." },
  ],
  fr: [
    { id: "fr-1", sentence: "Je pratique l'anglais tous les jours." },
    { id: "fr-2", sentence: "Elle boit une tasse de café le matin." },
    { id: "fr-3", sentence: "Nous irons à Paris cet été." },
  ],
  es: [
    { id: "es-1", sentence: "Estudio inglés todos los días." },
    { id: "es-2", sentence: "Ella toma una taza de café por la mañana." },
    { id: "es-3", sentence: "Visitaremos Madrid el próximo verano." },
  ],
  ar: [
    { id: "ar-1", sentence: "أدرسُ الإنجليزية كلَّ يومٍ." },
    { id: "ar-2", sentence: "تشربُ كوبًا من القهوةِ في الصباح." },
    { id: "ar-3", sentence: "سنزورُ القاهرةَ في الصيفِ القادم." },
  ],
};

// ————————————————————————————————————————————————————————
// Traductions locales (UI de la page)
// ————————————————————————————————————————————————————————
const tr = {
  fr: {
    title: "Playground — Réarrangeur de phrase",
    subtitle: "Choisis un jeu d'exemples, change la langue d'interface, et teste le composant.",
    chooseSet: "Jeu d'exemples",
    langUI: "Langue UI",
    score: "Score",
    attempts: "tentatives",
    correct: "correctes",
    next: "Phrase suivante",
    reshuffle: "Remélanger",
    reset: "Réinitialiser",
    successNote: "Bonne réponse !",
  },
  en: {
    title: "Playground — Sentence Arranger",
    subtitle: "Pick a sample set, switch UI language, and try the component.",
    chooseSet: "Sample set",
    langUI: "UI language",
    score: "Score",
    attempts: "attempts",
    correct: "correct",
    next: "Next sentence",
    reshuffle: "Reshuffle",
    reset: "Reset",
    successNote: "Correct answer!",
  },
  ar: {
    title: "ساحة تجريب — مُرتِّب الجُمل",
    subtitle: "اختر مجموعة أمثلة وبدّل لغة الواجهة وجرب المكوِّن.",
    chooseSet: "مجموعة الأمثلة",
    langUI: "لغة الواجهة",
    score: "النتيجة",
    attempts: "محاولات",
    correct: "صحيحة",
    next: "الجملة التالية",
    reshuffle: "إعادة خلط",
    reset: "إعادة تعيين",
    successNote: "إجابة صحيحة!",
  },
  es: {
    title: "Playground — Ordenar Oraciones",
    subtitle: "Elige un conjunto de ejemplos, cambia el idioma de la interfaz y prueba el componente.",
    chooseSet: "Conjunto de ejemplos",
    langUI: "Idioma de la UI",
    score: "Puntuación",
    attempts: "intentos",
    correct: "correctas",
    next: "Siguiente frase",
    reshuffle: "Mezclar de nuevo",
    reset: "Reiniciar",
    successNote: "¡Respuesta correcta!",
  },
} as const;

export default function Test2() {
  const { language, setLanguage } = useTranslate();
  type Keys = keyof typeof tr.fr;
  const t = (key: Keys) => (tr as any)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  // État du jeu
  const [setLang, setSetLang] = useState<keyof typeof samples>("en");
  const [index, setIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0); // pour remonter le composant et remélanger
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const current = useMemo(() => {
    const list = samples[setLang];
    const safeIndex = Math.min(index, list.length - 1);
    return list[safeIndex];
  }, [setLang, index]);

  const onFetchAnswer = async (id: string, ok: boolean) => {
    setAttempts((n) => n + 1);
    setLastCorrect(ok);
    if (ok) setCorrect((n) => n + 1);
    return ok ? "ok" : "ko";
  };

  const nextSentence = () => {
    const list = samples[setLang];
    setIndex((i) => (i + 1) % list.length);
    setRefreshKey((k) => k + 1);
    setLastCorrect(null);
  };

  const reshuffle = () => setRefreshKey((k) => k + 1);
  const resetAll = () => {
    setIndex(0);
    setAttempts(0);
    setCorrect(0);
    setRefreshKey((k) => k + 1);
    setLastCorrect(null);
  };

  const progress = attempts === 0 ? 0 : Math.round((correct / attempts) * 100);

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 md:p-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">{t("title")}</h1>
          <p className="text-[#111827]/70">{t("subtitle")}</p>
        </div>

        {/* Barres de contrôle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {/* Choix du set d'exemples */}
          <div className="bg-white rounded-2xl shadow-2xl border border-[#F3F4F6] p-4">
            <div className="text-sm font-semibold text-[#111827] mb-2">{t("chooseSet")}</div>
            <div className="grid grid-cols-4 gap-2">
              {(["en", "fr", "es", "ar"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => { setSetLang(code); setIndex(0); setRefreshKey((k)=>k+1); setLastCorrect(null); }}
                  className={[
                    "py-2 px-3 rounded-2xl border shadow-sm text-sm",
                    "transition hover:scale-105 active:scale-95",
                    setLang === code ? "bg-[#3B82F6] text-white border-[#3B82F6]" : "bg-white text-[#111827] border-[#F3F4F6]",
                  ].join(" ")}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-[#111827]/60">{current.sentence}</div>
          </div>

          {/* Langue UI */}
          <div className="bg-white rounded-2xl shadow-2xl border border-[#F3F4F6] p-4">
            <div className="text-sm font-semibold text-[#111827] mb-2 inline-flex items-center gap-2">
              <Globe2 className="w-4 h-4" /> {t("langUI")}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(["en", "fr", "es", "ar"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage?.(code)}
                  className={[
                    "py-2 px-3 rounded-2xl border shadow-sm text-sm",
                    "transition hover:scale-105 active:scale-95",
                    language === code ? "bg-[#22C55E] text-white border-[#22C55E]" : "bg-white text-[#111827] border-[#F3F4F6]",
                  ].join(" ")}
                  aria-pressed={language === code}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Score */}
          <div className="bg-white rounded-2xl shadow-2xl border border-[#F3F4F6] p-4 flex flex-col justify-between">
            <div>
              <div className="text-sm font-semibold text-[#111827] mb-2">{t("score")}</div>
              <div className="text-sm text-[#111827]/80 mb-2">
                {correct} / {attempts} {t("correct")} ({attempts} {t("attempts")})
              </div>
              <div className="h-2 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
                <div className="h-full bg-[#22C55E] rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
            {lastCorrect && (
              <div className="mt-3 inline-flex items-center gap-2 text-[#111827] text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> {t("successNote")}
              </div>
            )}
          </div>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-2xl border border-[#F3F4F6] p-4 md:p-6">
          <SentenceArrangeComponent
            key={`${current.id}-${refreshKey}`}
            questionId={current.id}
            sentence={current.sentence}
            correctAnswer={current.sentence}
            fetchAnswer={onFetchAnswer}
          />

          {/* Actions */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={nextSentence}
              className="w-full py-3 px-4 rounded-2xl bg-[#3B82F6] text-white shadow-md hover:scale-105 active:scale-95 transition inline-flex items-center justify-center gap-2"
            >
              <StepForward className="w-4 h-4" /> {t("next")}
            </button>
            <button
              type="button"
              onClick={reshuffle}
              className="w-full py-3 px-4 rounded-2xl bg-white text-[#111827] border border-[#F3F4F6] shadow-md hover:scale-105 active:scale-95 transition inline-flex items-center justify-center gap-2"
            >
              <Shuffle className="w-4 h-4" /> {t("reshuffle")}
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="w-full py-3 px-4 rounded-2xl bg-white text-[#111827] border border-[#F3F4F6] shadow-md hover:scale-105 active:scale-95 transition inline-flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> {t("reset")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
