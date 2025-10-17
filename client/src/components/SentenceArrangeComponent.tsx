import React, { useEffect, useMemo, useState } from "react";
import { Shuffle, RotateCcw, CheckCircle2, XCircle, GripVertical } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";

// 🔤 Types
export type LocalType = "en" | "fr" | "es" | "ar";

type Props = {
  questionId: string;
  sentence: string; // phrase à mélanger
  correctAnswer?: string; // si absent, on compare à `sentence`
  fetchAnswer: (id: string, isCorrect: boolean) => Promise<string>;
};

// 🌍 Traductions locales
const tr = {
  fr: {
    title: "Réarrange la phrase",
    instruction: "Appuie sur les jetons pour construire la phrase dans le bon ordre.",
    poolTitle: "Mots mélangés",
    answerTitle: "Ta réponse",
    placeholder: "Ta réponse apparaîtra ici…",
    shuffle: "Mélanger",
    clear: "Effacer",
    validate: "Valider",
    validating: "Validation…",
    correct: "Bonne réponse !",
    incorrect: "Mauvaise réponse.",
  },
  en: {
    title: "Rearrange the sentence",
    instruction: "Tap the tiles to build the sentence in the correct order.",
    poolTitle: "Shuffled tiles",
    answerTitle: "Your answer",
    placeholder: "Your answer will appear here…",
    shuffle: "Shuffle",
    clear: "Clear",
    validate: "Validate",
    validating: "Validating…",
    correct: "Correct answer!",
    incorrect: "Incorrect answer.",
  },
  ar: {
    title: "أعد ترتيب الجملة",
    instruction: "اضغط على القطع لبناء الجملة بالترتيب الصحيح.",
    poolTitle: "قطع عشوائية",
    answerTitle: "إجابتك",
    placeholder: "ستظهر إجابتك هنا…",
    shuffle: "اعادة خلط",
    clear: "مسح",
    validate: "تحقّق",
    validating: "جارٍ التحقق…",
    correct: "إجابة صحيحة!",
    incorrect: "إجابة خاطئة.",
  },
  es: {
    title: "Reordena la frase",
    instruction: "Toca las fichas para construir la frase en el orden correcto.",
    poolTitle: "Fichas mezcladas",
    answerTitle: "Tu respuesta",
    placeholder: "Tu respuesta aparecerá aquí…",
    shuffle: "Mezclar",
    clear: "Borrar",
    validate: "Validar",
    validating: "Validando…",
    correct: "¡Respuesta correcta!",
    incorrect: "Respuesta incorrecta.",
  },
} as const;

// 🔧 Utils
type Token = { id: string; text: string };

const PUNCT = new Set([".", ",", "!", "?", ";", ":", "…", "—", "–", "-", "\"", "'", "«", "»", ")", "]", "}"]); // ponctuation collée à gauche
const OPEN_PUNCT = new Set(["(", "[", "{", "«"]); // ponctuation collée à droite

function tokenize(input: string): string[] {
  // coupe en mots/ponctuation; compatible langues latines + arabe via Unicode classes
const re = /\p{L}[\p{L}\p{N}'’]*|\p{N}+|[.,!?;:…—–-]|["'«»()[\]{}]/gu;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) out.push(m[0]);
  return out.length ? out : input.trim().split(/\s+/);
}

function joinTokens(tokens: string[]): string {
  let s = "";
  for (const tok of tokens) {
    if (s.length === 0) {
      s = tok;
      continue;
    }
    if (PUNCT.has(tok)) {
      // pas d'espace avant . , ! ? ; : … etc.
      s += tok;
    } else if (OPEN_PUNCT.has(tok)) {
      // pas d'espace après ouvrants
      s += tok;
    } else if (PUNCT.has(s[s.length - 1])) {
      // si le précédent est ponctuation ouvrante collée, pas d'espace
      s += tok;
    } else {
      s += " " + tok;
    }
  }
  return s;
}

function normalizeForCompare(s: string) {
  return s
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?;:…])/g, "$1")
    .replace(/([«([{])\s+/g, "$1")
    .trim()
    .toLowerCase();
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SentenceArrangeComponent({ questionId, sentence, correctAnswer, fetchAnswer }: Props) {
  const { language } = useTranslate();
  type Keys = keyof typeof tr.fr;
  const t = (key: Keys) => (tr as Record<string, Record<string, string>>)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  // Tokens de base
  const baseTokens = useMemo(() => tokenize(correctAnswer ?? sentence), [sentence, correctAnswer]);
  const [pool, setPool] = useState<Token[]>(() => shuffle(baseTokens).map((text, i) => ({ id: `${i}-${Math.random()}`, text })));
  const [answer, setAnswer] = useState<Token[]>([]);

  const [hasValidated, setHasValidated] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset quand la phrase change
  useEffect(() => {
    const shuffled = shuffle(baseTokens);
    // éviter le même ordre que l'original
    const isSame = JSON.stringify(shuffled) === JSON.stringify(baseTokens);
    const final = isSame ? shuffle(shuffled) : shuffled;
    setPool(final.map((text, i) => ({ id: `${i}-${Math.random()}`, text })));
    setAnswer([]);
    setHasValidated(false);
    setIsCorrect(null);
    setSubmitting(false);
  }, [baseTokens.join("\u0001")]);

  // Mouvements
  const moveToAnswer = (token: Token) => {
    if (hasValidated) return;
    setPool((p) => p.filter((t) => t.id !== token.id));
    setAnswer((a) => [...a, token]);
  };
  const moveToPool = (token: Token) => {
    if (hasValidated) return;
    setAnswer((a) => a.filter((t) => t.id !== token.id));
    setPool((p) => [...p, token]);
  };

  // Drag & drop basique pour réordonner la réponse
  const onDragStart = (e: React.DragEvent<HTMLButtonElement>, idx: number) => {
    e.dataTransfer.setData("text/plain", String(idx));
  };
  const onDropReorder = (e: React.DragEvent<HTMLButtonElement>, idx: number) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isNaN(from) || from === idx) return;
    setAnswer((a) => {
      const next = a.slice();
      const [m] = next.splice(from, 1);
      next.splice(idx, 0, m);
      return next;
    });
  };

  const handleValidate = async () => {
    if (hasValidated) return;
    const userSentence = joinTokens(answer.map((t) => t.text));
    const target = correctAnswer ?? sentence;
    const correct = normalizeForCompare(userSentence) === normalizeForCompare(target);

    setHasValidated(true);
    setIsCorrect(correct);

    try {
      setSubmitting(true);
      await fetchAnswer(questionId, correct);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShuffle = () => setPool((p) => shuffle(p));
  const handleClear = () => {
    if (hasValidated) return;
    setPool((p) => [...p, ...answer]);
    setAnswer([]);
  };

  const validateDisabled = submitting || answer.length !== baseTokens.length;

  return (
    <div className="w-full max-w-3xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-[#F3F4F6] p-5 md:p-8">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-[#111827]">{t("title")}</h2>
          <p className="text-sm text-[#111827]/70 mt-1">{t("instruction")}</p>
        </div>

        {/* Réponse (zone de construction) */}
        <div className="mb-4">
          <div className="text-sm font-semibold text-[#111827] mb-2">{t("answerTitle")}</div>
          <div className="min-h-[64px] rounded-2xl border border-dashed border-[#F3F4F6] bg-[#F3F4F6] p-2 flex flex-wrap gap-2">
            {answer.length === 0 && (
              <span className="text-[#111827]/50 text-sm">{t("placeholder")}</span>
            )}
            {answer.map((tok, idx) => (
              <button
                key={tok.id}
                draggable={!hasValidated}
                onDragStart={(e) => onDragStart(e, idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDropReorder(e, idx)}
                type="button"
                onClick={() => moveToPool(tok)}
                className={[
                  "inline-flex items-center gap-1 px-3 py-2 rounded-2xl",
                  "bg-white dark:bg-gray-800 text-[#111827] border border-[#E5E7EB] shadow-sm",
                  "hover:scale-105 active:scale-95 transition",
                ].join(" ")}
                title={isRTL ? "إزالة" : "Remove"}
              >
                <GripVertical className="w-3.5 h-3.5 text-[#111827]/40" />
                <span className="text-sm font-medium">{tok.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Jetons mélangés */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#111827]">{t("poolTitle")}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShuffle}
                className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-[#F3F4F6] shadow-sm text-sm text-[#111827] hover:scale-105 active:scale-95 transition inline-flex items-center gap-1"
                title={t("shuffle")}
              >
                <Shuffle className="w-4 h-4" /> {t("shuffle")}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-[#F3F4F6] shadow-sm text-sm text-[#111827] hover:scale-105 active:scale-95 transition inline-flex items-center gap-1"
                title={t("clear")}
              >
                <RotateCcw className="w-4 h-4" /> {t("clear")}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {pool.map((tok) => (
              <button
                key={tok.id}
                type="button"
                onClick={() => moveToAnswer(tok)}
                className={[
                  "px-3 py-2 rounded-2xl bg-white dark:bg-gray-800 text-[#111827] border border-[#F3F4F6] shadow-sm",
                  "hover:scale-105 active:scale-95 transition text-sm font-medium",
                ].join(" ")}
              >
                {tok.text}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {hasValidated && (
          <div
            className={[
              "w-full py-3 px-4 rounded-2xl border shadow-md flex items-center gap-2 mb-4",
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

        {/* Action principale */}
        <button
          type="button"
          onClick={handleValidate}
          disabled={validateDisabled}
          className={[
            "w-full py-3 px-6 rounded-2xl shadow-md text-white text-lg",
            "transition hover:scale-105 active:scale-95",
            validateDisabled ? "bg-[#3B82F6]/60 cursor-not-allowed" : "bg-[#3B82F6]",
          ].join(" ")}
        >
          {submitting ? t("validating") : t("validate")}
        </button>
      </div>
    </div>
  );
}
