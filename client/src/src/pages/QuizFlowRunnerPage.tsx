import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

import { useTranslate } from "../contexts/TranslateContext";

import SentenceArrangeComponent from "../components/SentenceArrangeComponent";
import QuestionComponent from "../components/QuestionComponent";
import TTSQuestionComponent from "../components/AudioComponent";
import SpellingComponent from "../components/SpellingComponent";
import SpeakingComponent from "../components/SpeakingComponent";

import { getQuizzes, updateQuiz } from "../../services/quiz.services";
import { getUserWords } from "../../services/user-word.services";
import { useActivityTracker } from "../../hooks/useActivityTracker";

export type QuizType =
  | "translationEnglishToOther"
  | "translationOtherToEnglish"
  | "meaning"
  | "audio"
  | "wordSorting"
  | "spelling"
  | "speaking";

export interface Quiz {
  id: string;
  userWordId: string;
  question: string;
  options?: string[] | null;
  correctAnswer: string;
  type: QuizType;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // backend: peut être boolean[]; on supporte aussi boolean | null par sécurité
  areUserAnswersCorrect?: boolean[] | boolean | null;
}

const tr = {
  fr: {
    title: "Exercices",
    progress: "Progression",
    questionOf: (i: number, n: number) => `Question ${i} / ${n}`,
    loading: "Chargement des quiz…",
    empty: "Aucun quiz trouvé pour ce mot.",
    prev: "Précédent",
    next: "Suivant",
    finish: "Terminer",
    resumeTitle: "Résumé",
    correct: "correctes",
    incorrect: "incorrectes",
    tryAgain: "Recommencer",
    backToWord: "Retour au mot",
    locked: "Réponds d’abord à la question pour continuer",
  },
  en: {
    title: "Exercises",
    progress: "Progress",
    questionOf: (i: number, n: number) => `Question ${i} / ${n}`,
    loading: "Loading quizzes…",
    empty: "No quiz found for this word.",
    prev: "Previous",
    next: "Next",
    finish: "Finish",
    resumeTitle: "Summary",
    correct: "correct",
    incorrect: "incorrect",
    tryAgain: "Restart",
    backToWord: "Back to word",
    locked: "Answer this question first to continue",
  },
  ar: {
    title: "تمارين",
    progress: "التقدم",
    questionOf: (i: number, n: number) => `السؤال ${i} / ${n}`,
    loading: "جارٍ تحميل الاختبارات…",
    empty: "لا توجد أسئلة لهذا الكلمة.",
    prev: "السابق",
    next: "التالي",
    finish: "إنهاء",
    resumeTitle: "الملخص",
    correct: "صحيحة",
    incorrect: "خاطئة",
    tryAgain: "إعادة المحاولة",
    backToWord: "العودة إلى الكلمة",
    locked: "أجب عن هذا السؤال أولاً للمتابعة",
  },
  es: {
    title: "Ejercicios",
    progress: "Progreso",
    questionOf: (i: number, n: number) => `Pregunta ${i} / ${n}`,
    loading: "Cargando cuestionarios…",
    empty: "No hay cuestionarios para esta palabra.",
    prev: "Anterior",
    next: "Siguiente",
    finish: "Terminar",
    resumeTitle: "Resumen",
    correct: "correctas",
    incorrect: "incorrectas",
    tryAgain: "Reiniciar",
    backToWord: "Volver a la palabra",
    locked: "Responde primero para continuar",
  },
} as const;

export default function QuizFlowRunner() {
  const { language } = useTranslate();
  const t = useCallback(
    (key: keyof typeof tr["fr"], ...args: unknown[]) => {
      const val = (tr as Record<string, Record<string, string | ((...args: unknown[]) => string)>>)[language]?.[key] ?? (tr as Record<string, Record<string, string | ((...args: unknown[]) => string)>>).en[key];
      return typeof val === "function" ? val(...args) : val;
    },
    [language]
  );
  const isRTL = language === "ar";

  // ⚠️ Param = WORD ID (pas userWordId)
  const params = useParams();
  const navigate = useNavigate();
  const wordId = params.userWordId as string; // la route s'appelle peut-être :userWordId mais c'est bien un wordId

  const [userWord, setUserWord] = useState<{ id: string; wordId: string; [key: string]: unknown }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [index, setIndex] = useState(0);

  const [answered, setAnswered] = useState<Record<string, boolean>>({});
  const [correctMap, setCorrectMap] = useState<Record<string, boolean>>({});
  
  // 🔥 Hook pour tracker les activités
  const { trackQuiz } = useActivityTracker();

  const total = quizzes.length;
  const current = quizzes[index];
  const answeredCount = useMemo(
    () => Object.keys(answered).filter((id) => answered[id]).length,
    [answered]
  );
  const progressPct = total ? Math.round((answeredCount / total) * 100) : 0;

  // Utils sûrs
  const toArray = <T,>(maybeArr: unknown): T[] =>
    Array.isArray(maybeArr) ? maybeArr : [];

  const unwrapQuizzes = (res: unknown): Quiz[] => {
    // supporte Quiz[], {quizzes: Quiz[]}, {data: Quiz[]}
    if (Array.isArray(res)) return res;
    const resObj = res as { quizzes?: Quiz[]; data?: Quiz[] };
    if (Array.isArray(resObj?.quizzes)) return resObj.quizzes;
    if (Array.isArray(resObj?.data)) return resObj.data;
    return [];
  };

  const lastBool = (v: boolean[] | boolean | null | undefined): boolean | undefined => {
    if (Array.isArray(v)) return v.length ? v[v.length - 1] : undefined;
    if (typeof v === "boolean") return v;
    return undefined;
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Trouver le userWord correspondant à ce wordId
        let uw: { id: string; wordId: string; [key: string]: unknown } | undefined;
        try {
          const userWordsRes = await getUserWords();
          const userWords = toArray<{ id: string; wordId: string; [key: string]: unknown }>(userWordsRes);
          uw = userWords.find((u) => u?.wordId === wordId);
          if (mounted) setUserWord(uw);
        } catch {
          // non bloquant
        }

        // 2) Récupérer tous les quizzes et filtrer par userWord.id
        const allRes = await getQuizzes();
        const all = unwrapQuizzes(allRes);

        // si on n'a pas de userWord on ne peut pas filtrer : renvoyer vide
        const filtered = uw
          ? toArray<Quiz>(all).filter((q) => q.userWordId === uw.id)
          : [];

        const list = filtered.sort(
          (a, b) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
        );

        if (!mounted) return;

        setQuizzes(list);

        // 3) Construire l’état local depuis areUserAnswersCorrect
        const initAnswered: Record<string, boolean> = {};
        const initCorrect: Record<string, boolean> = {};

        list.forEach((q) => {
          const last = lastBool(q.areUserAnswersCorrect);
          if (last !== undefined) {
            initAnswered[q.id] = true;           // au moins une réponse existe
            initCorrect[q.id] = !!last;          // dernier résultat
          }
        });

        setAnswered(initAnswered);
        setCorrectMap(initCorrect);

        // 4) se placer sur la 1ʳᵉ non répondue
        const firstUnanswered = list.findIndex((q) => !initAnswered[q.id]);
        setIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
      } catch (e: unknown) {
        if (!mounted) return;
        const error = e as { message?: string };
        setError(error?.message || "Failed to load quizzes");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [wordId]);

  const fetchAnswer = useCallback(async (quizId: string, isCorrect: boolean) => {
    try {
      // 1. Mettre à jour le quiz côté backend
      await updateQuiz(quizId, isCorrect);
      
      // 2. 🔥 Enregistrer l'activité et mettre à jour le streak
      const quiz = quizzes.find((q) => q.id === quizId);
      if (quiz && userWord) {
        trackQuiz(quizId, userWord.id, isCorrect, quiz.correctAnswer).catch((err) => {
          console.warn("Failed to track activity:", err);
        });
      }
    } catch {
      // pas d'UI d'erreur ici
    } finally {
      setAnswered((prev) => (prev[quizId] ? prev : { ...prev, [quizId]: true }));
      setCorrectMap((prev) => ({ ...prev, [quizId]: isCorrect }));
    }
    return "ok";
  }, [quizzes, userWord, trackQuiz]);

  const canGoPrev = index > 0;
  const canGoNext = index < total - 1;
  const currentAnswered = current ? !!answered[current.id] : false;

  const goPrev = () => canGoPrev && setIndex((i) => i - 1);
  const goNext = () => {
    if (canGoNext && currentAnswered) setIndex((i) => i + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight" && currentAnswered) goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentAnswered, canGoPrev, canGoNext]);

 // 🧩 Rendu d'un quiz selon son type
const renderQuiz = (q: Quiz) => {
  switch (q.type) {
    case "wordSorting":
      return (
        <SentenceArrangeComponent
          key={q.id}
          questionId={q.id}
          fetchAnswer={fetchAnswer}
          sentence={q.question}
          correctAnswer={q.correctAnswer}
        />
      );

    case "audio":
      return (
        <TTSQuestionComponent
          key={q.id}
          question={{
            id: q.id,
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
          }}
          fetchAnswer={fetchAnswer}
        />
      );

    case "spelling":
      return (
        <SpellingComponent
          key={q.id}
          questionId={q.id}
          audioText={q.correctAnswer}
          correctAnswer={q.correctAnswer}
          fetchAnswer={fetchAnswer}
        />
      );

    case "speaking":
      return (
        <SpeakingComponent
          key={q.id}
          questionId={q.id}
          textToSpeak={q.correctAnswer}
          correctAnswer={q.correctAnswer}
          fetchAnswer={fetchAnswer}
        />
      );

    // 📝 Fallback choix multiples
    case "translationEnglishToOther":
    case "translationOtherToEnglish":
    case "meaning":
    default:
      return (
        <QuestionComponent
          key={q.id}
          question={{
            id: q.id,
            question: q.question,
            options: q.options || [q.correctAnswer],
            correctAnswer: q.correctAnswer,
          }}
          fetchAnswer={fetchAnswer}
        />
      );
  }
};


  const done = total > 0 && answeredCount === total;
  const correctCount = useMemo(
    () => quizzes.reduce((acc, q) => acc + (correctMap[q.id] ? 1 : 0), 0),
    [quizzes, correctMap]
  );

  const reset = () => {
    setIndex(0);
    setAnswered({});
    setCorrectMap({});
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4" dir={isRTL ? "rtl" : "ltr"}>
        <div className="w-14 h-14 rounded-full border-4 border-[#F3F4F6] border-t-[#3B82F6] animate-spin" />
        <p className="text-[#3B82F6] font-semibold">{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-red-200 text-red-700 rounded-2xl p-4" dir={isRTL ? "rtl" : "ltr"}>
        {error}
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-[#F3F4F6] rounded-2xl p-6 text-center" dir={isRTL ? "rtl" : "ltr"}>
        <p className="text-[#111827]">{t("empty")}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-[#3B82F6] text-white shadow-md hover:scale-105 active:scale-95 transition"
        >
          <ChevronLeft className="w-5 h-5" /> {t("backToWord")}
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-3xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-[#111827]">{t("resumeTitle")}</h1>
        </header>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1 text-sm text-[#111827]/70">
            <span>{t("progress")}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
            <div className="h-2 bg-[#22C55E] transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-white border border-[#F3F4F6] shadow-md flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-green-100 text-[#22C55E] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </span>
            <div>
              <div className="text-xl font-bold text-[#111827]">{correctCount}</div>
              <div className="text-sm text-[#111827]/70">{t("correct")}</div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#F3F4F6] shadow-md flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </span>
            <div>
              <div className="text-xl font-bold text-[#111827]">{total - correctCount}</div>
              <div className="text-sm text-[#111827]/70">{t("incorrect")}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="w-full py-3 px-6 rounded-2xl bg-[#3B82F6] text-white shadow-md hover:scale-105 active:scale-95 transition"
          >
            {t("tryAgain")}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 px-6 rounded-2xl bg-[#22C55E] text-white shadow-md hover:scale-105 active:scale-95 transition"
          >
            {t("backToWord")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      <header className="mb-4">
        <h1 className="text-xl font-bold text-[#111827]">{t("title")}</h1>
        <div className="text-sm text-[#111827]/70 mt-1">{t("questionOf", index + 1, total)}</div>
      </header>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1 text-sm text-[#111827]/70">
          <span>{t("progress")}</span>
          <span>{progressPct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
          <div className="h-2 bg-[#22C55E] transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <nav className="mb-4 flex items-center gap-2 overflow-x-auto" aria-label="Stepper">
        {quizzes.map((q, i) => {
          const isActive = i === index;
          const isDone = !!answered[q.id];
          return (
            <button
              key={q.id}
              onClick={() => i <= index && setIndex(i)}
              className={[
                "shrink-0 w-8 h-8 rounded-full border flex items-center justify-center",
                isActive ? "bg-[#3B82F6] text-white border-[#3B82F6]" : "bg-white text-[#111827] border-[#F3F4F6]",
                isDone && !isActive ? "ring-2 ring-[#22C55E]/40" : "",
                "transition hover:scale-105 active:scale-95",
              ].join(" ")}
              aria-current={isActive ? "step" : undefined}
              title={typeof tr[language]?.questionOf === "function" ? tr[language]!.questionOf!(i + 1, total) : ""}
            >
              {isDone ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
            </button>
          );
        })}
      </nav>

      <div className="bg-white rounded-2xl shadow-2xl border border-[#F3F4F6] p-4 md:p-6 mb-24">
        {current ? renderQuiz(current) : null}
      </div>

      <div className="fixed left-0 right-0 bottom-0 bg-white/95 backdrop-blur border-t border-[#F3F4F6] p-3">
        <div className="max-w-3xl mx-auto grid grid-cols-2 gap-3">
          <button
            onClick={goPrev}
            disabled={!canGoPrev}
            className={[
              "py-3 px-6 rounded-2xl shadow-md text-[#111827] border",
              canGoPrev ? "bg-white border-[#F3F4F6] hover:scale-105 active:scale-95" : "bg-white border-[#F3F4F6] opacity-50 cursor-not-allowed",
            ].join(" ")}
          >
            <span className="inline-flex items-center gap-2">
              <ChevronLeft className="w-5 h-5" /> {t("prev")}
            </span>
          </button>

          {index < total - 1 ? (
            <button
              onClick={goNext}
              disabled={!currentAnswered}
              className={[
                "py-3 px-6 rounded-2xl shadow-md text-white",
                currentAnswered ? "bg-[#3B82F6] hover:scale-105 active:scale-95" : "bg-[#3B82F6]/60 cursor-not-allowed",
              ].join(" ")}
              title={!currentAnswered ? t("locked") : undefined}
            >
              <span className="inline-flex items-center gap-2">
                {t("next")} <ChevronRight className="w-5 h-5" />
              </span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (answeredCount === total) setIndex(index);
              }}
              disabled={answeredCount !== total}
              className={[
                "py-3 px-6 rounded-2xl shadow-md text-white",
                answeredCount === total ? "bg-[#22C55E] hover:scale-105 active:scale-95" : "bg-[#22C55E]/60 cursor-not-allowed",
              ].join(" ")}
            >
              {t("finish")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
