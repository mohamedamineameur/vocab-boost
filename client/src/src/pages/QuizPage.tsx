import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles
} from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { useAuth } from "../contexts/AuthContext";

// ⚠️ Ajuste le chemin selon ton projet
import { getQuizzes, updateQuiz } from "../../services/quiz.services";
import { getWords } from "../../services/word.services";

// TTS & STT (Speech To Text)
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

// --- Types ---
export type QuizType =
  | "translationEnglishToOther"
  | "translationOtherToEnglish"
  | "meaning"
  | "audio"
  | "wordSorting"
  | "spelling"
  | "speaking";

type Quiz = {
  id: string;
  userWordId: string;
  question: string;
  options?: string[] | null;
  correctAnswer: string;
  type: QuizType;
  createdAt?: string;
  updatedAt?: string;
  areUserAnswersCorrect?: boolean[] | null;
  userWord?: { id: string; wordId: string; isLearned?: boolean };
};

type WordBrief = { id: string; text: string };

// --- i18n minimal ---
const i18n = {
  fr: {
    title: "Quiz du mot",
    back: "Retour",
    next: "Suivant",
    validate: "Valider",
    finish: "Terminer",
    restart: "Recommencer",
    noQuiz: "Aucun quiz trouvé pour ce mot.",
    progress: (i: number, t: number) => `Quiz ${i}/${t}`,
    correct: "Correct !",
    wrong: "Incorrect",
    tts: "Écouter",
    stopTts: "Stop",
    startRec: "Parler",
    stopRec: "Stop",
    notSupported: "Reconnaissance vocale non supportée sur ce navigateur.",
    yourAnswer: "Ta réponse",
    typeHere: "Tape ta réponse…",
    buildSentence: "Reconstitue la phrase",
    reset: "Réinitialiser",
  },
  en: {
    title: "Word Quiz",
    back: "Back",
    next: "Next",
    validate: "Check",
    finish: "Finish",
    restart: "Restart",
    noQuiz: "No quiz found for this word.",
    progress: (i: number, t: number) => `Quiz ${i}/${t}`,
    correct: "Correct!",
    wrong: "Wrong",
    tts: "Listen",
    stopTts: "Stop",
    startRec: "Speak",
    stopRec: "Stop",
    notSupported: "Speech recognition not supported in this browser.",
    yourAnswer: "Your answer",
    typeHere: "Type your answer…",
    buildSentence: "Build the sentence",
    reset: "Reset",
  }
};

function useI18n() {
  const { language } = useTranslate();
  const lang = (['fr','en','es','ar'] as const).includes(language as any) ? (language as 'fr'|'en'|'es'|'ar') : 'fr';
  const dict = (i18n as any)[lang] ?? i18n.en;
  return { t: (k: keyof typeof i18n.fr, ...args: any[]) => (typeof dict[k] === 'function' ? (dict[k] as any)(...args) : dict[k]) as string, lang } as const;
}

// --- Utils ---
const asArray = (v: any) => {
  if (Array.isArray(v)) return v;
  const keys = ["data", "rows", "items", "results", "quizzes"];
  for (const k of keys) if (Array.isArray(v?.[k])) return v[k];
  return [] as any[];
};

const normalize = (s?: string) => (s ?? "").trim().replace(/\s+/g, " ").toLowerCase();

const langToBCP47 = (lang: string) => {
  switch (lang) {
    case 'fr': return 'fr-FR';
    case 'es': return 'es-ES';
    case 'ar': return 'ar-SA';
    default: return 'en-US';
  }
};

// --- TTS ---
function useTTS() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speak = (text: string, lang: string) => {
    try {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = langToBCP47(lang);
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    } catch {}
  };
  const stop = () => {
    try { window.speechSynthesis.cancel(); } catch {}
  };
  return { speak, stop } as const;
}

// --- Option Button ---
function OptionButton({ label, selected, disabled, onClick }: { label: string; selected?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-full text-left rounded-2xl border px-4 py-3 transition shadow-sm",
        selected ? "bg-[#22C55E] text-white border-transparent" : "bg-white text-[#111827] border-black/10 hover:border-[#3B82F6]",
        disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-md active:scale-[0.98]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

// --- WordSorting helper ---
function TokenSorter({ target, initial, onChange }: { target: string; initial: string; onChange: (value: string) => void }) {
  const targetTokens = useMemo(() => target.split(/\s+/), [target]);
  const [pool, setPool] = useState<string[]>(() => initial.split(/\s+/));
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => { onChange(picked.join(' ')); }, [picked]);

  const pick = (i: number) => {
    setPicked((p) => [...p, pool[i]]);
    setPool((p) => p.filter((_, idx) => idx !== i));
  };
  const unpick = (i: number) => {
    setPool((p) => [...p, picked[i]]);
    setPicked((p) => p.filter((_, idx) => idx !== i));
  };
  const reset = () => { setPool(initial.split(/\s+/)); setPicked([]); };

  return (
    <div className="space-y-3">
      <div className="text-sm text-black/70">{i18n.en.buildSentence}</div>
      <div className="flex flex-wrap gap-2">
        {pool.map((tok, i) => (
          <button key={`p-${i}`} onClick={() => pick(i)} className="rounded-full bg-[#F3F4F6] px-3 py-1 text-sm hover:scale-105 transition">{tok}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 min-h-[40px] rounded-xl border border-black/10 bg-white p-2">
        {picked.map((tok, i) => (
          <button key={`k-${i}`} onClick={() => unpick(i)} className="rounded-full bg-[#3B82F6] text-white px-3 py-1 text-sm hover:opacity-90 transition">{tok}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm hover:shadow"><RotateCcw className="h-4 w-4"/> {i18n.en.reset}</button>
        <div className="text-xs text-black/50">{picked.length}/{targetTokens.length}</div>
      </div>
    </div>
  );
}

// --- Main page ---
export default function QuizPage() {
  const { wordId } = useParams<{ wordId: string }>();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { speak, stop } = useTTS();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [wordText, setWordText] = useState<string | null>(null);([]);

  // Stepper & answers
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null); // for MCQ/spelling/speaking
  const [builtSentence, setBuiltSentence] = useState<string>(""); // for sorting
  const [checking, setChecking] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  // STT
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true); setError(null);
        const [res, wordsRes] = await Promise.all([getQuizzes(), getWords()]);
        const list: Quiz[] = asArray(res);
        const filtered = list.filter((q) => q?.userWord?.wordId === wordId);
        const wordsList = asArray(wordsRes) as WordBrief[];
        const w = wordsList.find((x) => x.id === wordId);
        if (mounted) {
          setQuizzes(filtered);
          setWordText(w?.text ?? null);
        }
        if (filtered.length === 0) console.warn("No quizzes for this wordId", wordId);
      } catch (e: any) {
        setError(e?.message || "Failed to load quizzes");
      } finally { setLoading(false); }
    }
    load();
    return () => { SpeechRecognition.stopListening(); };
  }, [wordId]);

  const total = quizzes.length;
  const current = quizzes[index];
  const progressPct = total > 0 ? Math.round(((index) / total) * 100) : 0;

  // --- Actions ---
  const handleSpeak = (text?: string) => {
    if (!text) return;
    speak(text, lang);
  };

  const handleValidate = async () => {
    if (!current) return;
    setChecking(true);

    let userAnswer = selected ?? "";
    let isCorrect = false;

    if (current.type === 'wordSorting') {
      userAnswer = builtSentence;
      isCorrect = normalize(userAnswer) === normalize(current.correctAnswer);
    } else if (current.type === 'speaking') {
      const spoken = transcript || selected || "";
      userAnswer = spoken;
      isCorrect = normalize(spoken) === normalize(current.correctAnswer);
    } else if (current.type === 'spelling') {
      isCorrect = normalize(selected || "") === normalize(current.correctAnswer);
    } else {
      // MCQ / audio / meaning / translation*
      isCorrect = normalize(selected || "") === normalize(current.correctAnswer);
    }

    setLastCorrect(isCorrect);

    try {
      // Backend attend un tableau -> on envoie [isCorrect]
      await updateQuiz(current.id, isCorrect);
    } catch (e) {
      console.error("updateQuiz failed", e);
    }

    setChecking(false);
  };

  const handleNext = () => {
    stop();
    resetTranscript();
    setSelected(null);
    setBuiltSentence("");
    setLastCorrect(null);
    setIndex((i) => Math.min(i + 1, total));
  };

  const handleRestart = () => {
    stop();
    resetTranscript();
    setIndex(0);
    setSelected(null);
    setBuiltSentence("");
    setLastCorrect(null);
  };

  const startRec = async () => {
    if (!browserSupportsSpeechRecognition) return;
    resetTranscript();
    await SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
  };
  const stopRec = async () => { await SpeechRecognition.stopListening(); };

  // --- Render helpers ---
  const renderQuizBody = (q: Quiz) => {
    switch (q.type) {
      case 'translationEnglishToOther':
      case 'translationOtherToEnglish':
      case 'meaning':
      case 'audio':
        return (
          <div className="space-y-3">
            {q.options?.map((opt) => (
              <OptionButton key={opt} label={opt} selected={selected === opt} onClick={() => setSelected(opt)} />
            ))}
          </div>
        );
      case 'spelling':
        return (
          <div className="space-y-3">
            <input
              value={selected ?? ''}
              onChange={(e) => setSelected(e.target.value)}
              placeholder={i18n.en.typeHere}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
            <div className="text-sm text-black/60">{i18n.en.yourAnswer}: <span className="text-black/80">{selected}</span></div>
          </div>
        );
      case 'speaking':
        return (
          <div className="space-y-3">
            <div className="rounded-2xl border border-black/10 bg-white p-3 min-h-[56px]">
              {browserSupportsSpeechRecognition ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-black/70 truncate">{transcript || (listening ? '…' : '—')}</div>
                  <div className="flex items-center gap-2">
                    {!listening ? (
                      <button onClick={startRec} className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] text-white px-3 py-1.5 hover:opacity-90"><Mic className="h-4 w-4"/>{i18n.en.startRec}</button>
                    ) : (
                      <button onClick={stopRec} className="inline-flex items-center gap-2 rounded-xl bg-[#22C55E] text-white px-3 py-1.5 hover:opacity-90"><MicOff className="h-4 w-4"/>{i18n.en.stopRec}</button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-amber-700">{i18n.en.notSupported}</div>
              )}
            </div>
          </div>
        );
      case 'wordSorting': {
        const [correct, scrambled] = q.options ?? [q.correctAnswer, q.correctAnswer];
        const initial = scrambled || q.correctAnswer;
        return (
          <TokenSorter target={q.correctAnswer} initial={initial} onChange={setBuiltSentence} />
        );
      }
      default:
        return null;
    }
  };

  const questionFor = (q: Quiz) => {
    if (q.type === 'meaning') {
      return `Choose the correct meaning of "${wordText ?? 'this word'}"`;
    }
    return q.question;
  };

  const renderTTSButtons = (q: Quiz) => (
    <div className="flex items-center gap-2">
      <button onClick={() => handleSpeak(questionFor(q))} className="inline-flex items-center gap-2 rounded-xl bg-white border border-black/10 px-3 py-1.5 text-sm hover:shadow"><Volume2 className="h-4 w-4"/>{i18n.en.tts}</button>
      <button onClick={() => stop()} className="inline-flex items-center gap-2 rounded-xl bg-white border border-black/10 px-3 py-1.5 text-sm hover:shadow"><VolumeX className="h-4 w-4"/>{i18n.en.stopTts}</button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen grid place-content-center bg-gradient-to-b from-white to-[#F3F4F6] text-[#111827]">
        <div className="flex items-center gap-3 text-[#111827]">
          <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]"/>
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#F3F4F6] text-[#111827]">
        <header className="px-5 pt-6 pb-3 sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-black/5">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-2xl border border-black/10 px-3 py-2 text-sm bg-white"><ChevronLeft className="h-4 w-4"/>{t('back')}</button>
            <div className="text-sm text-black/60">{t('title')}</div>
          </div>
        </header>
        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-5 py-10">
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-[#22C55E]"/>
              <p className="mt-3">{t('noQuiz')}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#F3F4F6] text-[#111827]">
      {/* Header */}
      <header className="px-5 pt-6 pb-3 sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-black/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-2xl border border-black/10 px-3 py-2 text-sm bg-white"><ChevronLeft className="h-4 w-4"/>{t('back')}</button>
          <div className="flex-1 mx-3">
            <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden">
              <div className="h-full bg-[#22C55E]" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="mt-1 text-xs text-black/60 text-right">{i18n.en.progress(index + 1, total)}</div>
          </div>
          <div className="w-[88px]" />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 py-6">
          <div className="rounded-2xl bg-white border border-black/5 shadow-md p-5">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-lg font-semibold leading-snug flex-1">{questionFor(current)}</h1>
              {renderTTSButtons(current)}
            </div>

            <div className="mt-4">
              {renderQuizBody(current)}
            </div>

            {/* Feedback */}
            {lastCorrect !== null && (
              <div className={[
                "mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                lastCorrect ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#FEF2F2] text-[#991B1B]"
              ].join(' ')}>
                {lastCorrect ? <CheckCircle2 className="h-5 w-5"/> : <XCircle className="h-5 w-5"/>}
                <span>{lastCorrect ? t('correct') : t('wrong')}</span>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lastCorrect === null ? (
                <button
                  onClick={handleValidate}
                  disabled={checking || (current.type === 'wordSorting' ? !builtSentence : (current.type === 'speaking' ? (!transcript && !selected) : !selected))}
                  className={[
                    "inline-flex items-center justify-center gap-2 rounded-2xl py-3 px-6 shadow-md transition",
                    "bg-[#3B82F6] text-white hover:scale-105 active:scale-95",
                    checking ? "opacity-70 cursor-not-allowed" : ""
                  ].join(' ')}
                >
                  {checking ? <Loader2 className="h-5 w-5 animate-spin"/> : <CheckCircle2 className="h-5 w-5"/>}
                  {t('validate')}
                </button>
              ) : (
                <button
                  onClick={index + 1 < total ? handleNext : () => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl py-3 px-6 shadow-md bg-[#22C55E] text-white hover:scale-105 active:scale-95"
                >
                  {index + 1 < total ? (<><ChevronRight className="h-5 w-5"/>{t('next')}</>) : (<><CheckCircle2 className="h-5 w-5"/>{t('finish')}</>)}
                </button>
              )}

              <button
                onClick={handleRestart}
                className="inline-flex items-center justify-center gap-2 rounded-2xl py-3 px-6 shadow-md bg-white border border-black/10 hover:shadow"
              >
                <RotateCcw className="h-5 w-5"/> {t('restart')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
