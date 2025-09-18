import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Loader2,
  ChevronRight,
  Search,
  RefreshCcw,
  Sparkles,
  Tag,
  TriangleAlert
} from "lucide-react";

import { useTranslate } from "../contexts/TranslateContext";
import { useAuth } from "../contexts/AuthContext";

import { getWords } from "../../services/word.services";
import { getUserWords, createUserWord } from "../../services/user-word.services";
import { getCategories } from "../../services/category.services";

// --- Types
type Level =
  | "beginnerLevelOne"
  | "beginnerLevelTwo"
  | "intermediateLevelOne"
  | "intermediateLevelTwo"
  | "advancedLevelOne"
  | "advancedLevelTwo";

export type Word = {
  id: string;
  text: string;
  meaning: string;
  example?: string;
  categoryId: string | null;
  pronunciation?: string;
  frTranslation?: string;
  esTranslation?: string;
  arTranslation?: string;
  level?: Level;
  synonyms?: string[];
  antonyms?: string[];
  lexicalField?: string[];
};

export type UserWord = {
  id?: string;
  userId: string;
  wordId: string;
  isLearned?: boolean;
  word?: Word;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  frTranslation?: string;
  esTranslation?: string;
  arTranslation?: string;
};

// --- i18n minimal
const i18n = {
  fr: {
    title: "Sélecteur de mots",
    back: "Retour",
    searchPlaceholder: "Rechercher un mot…",
    suggestions: "Suggestions (10 au hasard)",
    shuffle: "Rafraîchir",
    yourWords: "Tes mots dans cette catégorie",
    addSelection: "Ajouter la sélection",
    saving: "Enregistrement…",
    saved: "Mots enregistrés !",
    emptyCat: "Aucun mot trouvé pour cette catégorie.",
    already: "Déjà ajouté",
    select: "Sélectionner",
    selected: "Sélectionné",
    mismatchHint: "Aucune correspondance par ID. On essaie une correspondance par nom puis des suggestions proches.",
  },
  en: {
    title: "Word Picker",
    back: "Back",
    searchPlaceholder: "Search a word…",
    suggestions: "Suggestions (10 random)",
    shuffle: "Shuffle",
    yourWords: "Your words in this category",
    addSelection: "Add selection",
    saving: "Saving…",
    saved: "Saved!",
    emptyCat: "No words found for this category.",
    already: "Already added",
    select: "Select",
    selected: "Selected",
    mismatchHint: "No ID match. Falling back to name match, then related suggestions.",
  },
  es: {
    title: "Selector de palabras",
    back: "Atrás",
    searchPlaceholder: "Buscar una palabra…",
    suggestions: "Sugerencias (10 aleatorias)",
    shuffle: "Mezclar",
    yourWords: "Tus palabras en esta categoría",
    addSelection: "Agregar selección",
    saving: "Guardando…",
    saved: "¡Guardado!",
    emptyCat: "No se encontraron palabras para esta categoría.",
    already: "Ya agregado",
    select: "Seleccionar",
    selected: "Seleccionado",
    mismatchHint: "No hay coincidencia de ID. Volviendo a la coincidencia de nombre, luego a sugerencias relacionadas.",
  },
  ar: {
    title: "منتقي الكلمات",
    back: "عودة",
    searchPlaceholder: "ابحث عن كلمة...",
    suggestions: "اقتراحات (10 عشوائية)",
    shuffle: "خلط",
    yourWords: "كلماتك في هذه الفئة",
    addSelection: "إضافة التحديد",
    saving: "جارٍ الحفظ...",
    saved: "تم الحفظ!",
    emptyCat: "لم يتم العثور على كلمات لهذه الفئة.",
    already: "تمت إضافته بالفعل",
    select: "تحديد",
    selected: "تم التحديد",
    mismatchHint: "لا توجد مطابقة للمعرف. العودة إلى مطابقة الاسم، ثم الاقتراحات ذات الصلة.",
  },
};
function useI18n() {
  const { language } = useTranslate();
  const lang = (["fr","en","es","ar"] as const).includes(language as any) ? language : "fr";
  const dict = (i18n as any)[lang] ?? i18n.en;
  return { t: (k: keyof typeof i18n.fr) => dict[k] ?? i18n.en[k] };
}

// --- utils
const asArray = (v: any) => {
  if (Array.isArray(v)) return v;
  const keys = ["data", "rows", "items", "results", "userWords", "words", "categories"];
  for (const k of keys) if (Array.isArray(v?.[k])) return v[k];
  return [] as any[];
};

const shuffleSample = <T,>(arr: T[], n: number) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
};

const norm = (s?: string) => (s ?? "").trim().toLowerCase();
const sameName = (a?: string, b?: string) => norm(a) && norm(a) === norm(b);

// Heuristiques très simples par nom de catégorie → mots proches (lexicalField/synonyms/meaning)
const categoryHeuristics = (c?: Category): string[] => {
  const name = norm(c?.name || c?.frTranslation || c?.esTranslation || c?.arTranslation);
  if (!name) return [];
  if (name.includes("house") || name.includes("maison")) {
    return ["home","house","furniture","bedroom","kitchen","living room","storage","bedding"];
  }
  if (name.includes("food") || name.includes("boisson") || name.includes("drink")) {
    return ["food","drink","meal","fruit","vegetable","kitchen"];
  }
  if (name.includes("family") || name.includes("famille")) {
    return ["family","mother","father","sister","brother","home"];
  }
  // ajoute si besoin d'autres règles
  return [name];
};

// --- UI petites cartes mots
function WordCard({
  w,
  selected,
  disabled,
  onToggle
}: {
  w: Word;
  selected: boolean;
  disabled?: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-black/10 bg-white p-4 shadow-sm",
        disabled ? "opacity-60" : "",
        selected ? "ring-2 ring-[#3B82F6]" : ""
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center">
            <Tag className="text-[#3B82F6]" />
          </div>
          <div>
            <div className="font-semibold text-[#111827]">{w.text}</div>
            {w.pronunciation && (
              <div className="text-xs text-black/60">{w.pronunciation}</div>
            )}
          </div>
        </div>
        <button
          onClick={() => !disabled && onToggle(w.id)}
          disabled={disabled}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm transition",
            disabled
              ? "bg-black/10 text-black/40 cursor-not-allowed"
              : selected
                ? "bg-[#22C55E] text-white"
                : "bg-[#3B82F6] text-white hover:opacity-90"
          ].join(" ")}
        >
          {disabled ? "Déjà ajouté" : selected ? "Sélectionné" : "Sélectionner"}
          {!disabled && selected && <CheckCircle2 className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-2 text-sm text-black/80">{w.meaning}</div>
      {w.example && <div className="mt-1 text-sm text-black/60 italic">“{w.example}”</div>}

      {(w.synonyms?.length || w.lexicalField?.length) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {(w.synonyms ?? []).slice(0, 4).map((s) => (
            <span key={s} className="text-xs bg-[#F3F4F6] px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
          {(w.lexicalField ?? []).slice(0, 3).map((s) => (
            <span key={s} className="text-xs bg-[#EEF2FF] px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WordSelectorPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [allWords, setAllWords] = useState<Word[]>([]);
  const [userWords, setUserWords] = useState<UserWord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [suggestionSeed, setSuggestionSeed] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [w, uw, cats] = await Promise.all([getWords(), getUserWords(), getCategories()]);
        if (!mounted) return;
        setAllWords(asArray(w));
        setUserWords(asArray(uw));
        setCategories(asArray(cats));
        console.log("⚙️ getWords ->", w);
        console.log("⚙️ getUserWords ->", uw);
        console.log("⚙️ getCategories ->", cats);
      } catch (e: any) {
        setError(e?.message || "Failed to load words");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Catégorie de l’URL
  const currentCategory = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId]
  );

  // ⚠️ Fallback : si ta BDD a des catégories dupliquées avec le même nom mais des IDs différents,
  // on considère toutes les catégories portant ce même nom/Traductions comme "équivalentes".
  const equivalentCategoryIds = useMemo(() => {
    if (!currentCategory) return categoryId ? [categoryId] : [];
    const names = [
      currentCategory.name,
      currentCategory.frTranslation,
      currentCategory.esTranslation,
      currentCategory.arTranslation
    ].filter(Boolean);

    const eqIds = categories
      .filter((c) =>
        [c.name, c.frTranslation, c.esTranslation, c.arTranslation]
          .filter(Boolean)
          .some((n) => names.some((nn) => sameName(n, nn)))
      )
      .map((c) => c.id);

    const set = new Set<string>([...(eqIds as string[]), categoryId!]);
    return Array.from(set);
  }, [currentCategory, categories, categoryId]);

  // Mots de cette (ou ces) catégorie(s)
  const wordsInCategory = useMemo(() => {
    return allWords.filter((w) => w.categoryId && equivalentCategoryIds.includes(w.categoryId));
  }, [allWords, equivalentCategoryIds]);

  // Set des mots déjà ajoutés (global + restreint à la catégorie affichée)
 // Set des mots déjà ajoutés (toutes catégories)
const alreadySelectedGlobal = useMemo(() => {
  return new Set(
    (userWords ?? [])
      .map((uw: any) => uw.wordId || uw.word_id || uw.word?.id) // ⬅️ ajoute uw.word_id
      .filter(Boolean) as string[]
  );
}, [userWords]);


  const alreadySelectedInCategory = useMemo(() => {
    const idsInCat = new Set(wordsInCategory.map((w) => w.id));
    const res = new Set<string>();
    alreadySelectedGlobal.forEach((id) => { if (idsInCat.has(id)) res.add(id); });
    return res;
  }, [alreadySelectedGlobal, wordsInCategory]);

  // Filtre recherche
  const filteredInCategory = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = wordsInCategory;
    if (!q) return base;
    return base.filter((w) => {
      const hay = [
        w.text, w.meaning, w.example, w.frTranslation, w.esTranslation, w.arTranslation,
        ...(w.synonyms ?? []),
        ...(w.lexicalField ?? []),
      ].filter(Boolean).map((x) => String(x).toLowerCase());
      return hay.some((s) => s.includes(q));
    });
  }, [wordsInCategory, query]);

  // Si rien ne matche par ID (cas signalé) → heuristiques par nom, puis fallback global
  const heuristicPool = useMemo(() => {
    if (filteredInCategory.length > 0) return filteredInCategory;
    const hints = categoryHeuristics(currentCategory);
    const byHeuristic = allWords.filter((w) => {
      const bag = [
        w.text, w.meaning, ...(w.synonyms ?? []), ...(w.lexicalField ?? [])
      ].filter(Boolean).map(norm);
      return hints.some((h) => bag.includes(norm(h)) || bag.some((x) => x.includes(norm(h))));
    });
    if (byHeuristic.length > 0) return byHeuristic;
    // dernier recours : pool global
    return allWords;
  }, [filteredInCategory, allWords, currentCategory]);

  // Mots disponibles à proposer (pas déjà sélectionnés)
  const available = useMemo(
    () => heuristicPool.filter((w) => !alreadySelectedGlobal.has(w.id)),
    [heuristicPool, alreadySelectedGlobal]
  );

  // Suggestions (10 aléatoires)
  const suggestions = useMemo(() => {
    void suggestionSeed;
    return shuffleSample(available, 10);
  }, [available, suggestionSeed]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      if (!user?.id) return;
      setSaving(true);
      setError(null);
      const toCreate = Array.from(selectedIds).filter((id) => !alreadySelectedGlobal.has(id));
      if (toCreate.length) {
        await Promise.all(
          toCreate.map((wordId) =>
            createUserWord({ userId: user.id, wordId, isLearned: false })
          )
        );
      }
      const uw = await getUserWords();
      setUserWords(asArray(uw));
      setSelectedIds(new Set());
    } catch (e: any) {
      setError(e?.message || "Failed to save words");
    } finally {
      setSaving(false);
    }
  };

  const language = useTranslate().language;

  const categoryTitle =
    currentCategory?.frTranslation ||
    currentCategory?.name ||
    i18n.fr.title;

  const idMismatch = !loading && wordsInCategory.length === 0 && (equivalentCategoryIds.length > 1 || !!currentCategory);
// Pool principal pour cette page : si on a des mots qui matchent l'ID, on les prend,
// sinon on prend le pool heuristique (mots "liés" à la catégorie)
const displayPool = useMemo(() => {
  return wordsInCategory.length > 0 ? wordsInCategory : heuristicPool;
}, [wordsInCategory, heuristicPool]);

// Mots déjà sélectionnés DANS le pool d'affichage (donc visible dans "Tes mots…")
const alreadySelectedForDisplay = useMemo(() => {
  const idsInPool = new Set(displayPool.map((w) => w.id));
  const res = new Set<string>();
  alreadySelectedGlobal.forEach((id) => { if (idsInPool.has(id)) res.add(id); });
  return res;
}, [alreadySelectedGlobal, displayPool]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#F3F4F6] text-[#111827]">
      {/* Header */}
      <header className="px-5 pt-6 pb-3 sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-black/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#111827]">{categoryTitle}</h1>
            <p className="text-sm text-black/60">{currentCategory?.description}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-black/10 px-3 py-2 text-sm bg-white text-[#111827]"
          >
            <ChevronRight className="h-4 w-4 rotate-180" /> {i18n.fr.back}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-5">
          {/* recherche */}
          <div className="sticky top-[60px] z-10 py-3 bg-gradient-to-b from-white/90 to-white/0 backdrop-blur">
            <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#3B82F6]">
              <Search className="h-5 w-5 text-[#3B82F6]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={i18n.fr.searchPlaceholder}
                className="w-full bg-transparent outline-none text-base"
                aria-label={i18n.fr.searchPlaceholder}
              />
            </div>
          </div>

          {/* états */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#3B82F6]" />
              <p className="mt-3 text-black/70">Chargement…</p>
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {String(error)}
            </div>
          )}

          {/* Aide : mismatch ID -> on informe qu'on fait un fallback */}
          {!loading && idMismatch && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-700 flex items-start gap-2">
              <TriangleAlert className="mt-0.5 h-5 w-5" />
              <p className="text-sm">{i18n.fr.mismatchHint}</p>
            </div>
          )}

          {/* Tes mots déjà choisis (dans cette catégorie si on en trouve) */}
         {!loading && alreadySelectedForDisplay.size > 0 && (
  <section className="mb-6">
    <h2 className="text-lg font-semibold mb-2">{i18n.fr.yourWords}</h2>
    <div className="flex flex-wrap gap-2">
      {Array.from(alreadySelectedForDisplay).map((id) => {
        const w = allWords.find((x) => x.id === id);
        return (
          <span key={id} className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-3 py-1 text-sm text-[#111827] cursor-pointer" onClick={() => navigate(`/words/${w?.id}/quizzes`)}>
            <Sparkles className="h-4 w-4 text-[#22C55E]" />
            {w?.text ?? id}
          </span>
        );
      })}
    </div>
  </section>
)}


          {/* Suggestions (toujours affichées pour pouvoir choisir) */}
          {!loading && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{i18n.fr.suggestions}</h2>
                <button
                  onClick={() => setSuggestionSeed((s) => s + 1)}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm bg-white border border-black/10 hover:shadow"
                >
                  <RefreshCcw className="h-4 w-4" />
                  {i18n.fr.shuffle}
                </button>
              </div>

              {suggestions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-[#F3F4F6] p-6 text-center">
                  {i18n.fr.emptyCat}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestions.map((w) => (
                    <WordCard
                      key={w.id}
                      w={w}
                      selected={selectedIds.has(w.id)}
                      onToggle={toggle}
                      // on laisse activé ici : même si le mot est dans une autre cat,
                      // l’utilisateur peut l’ajouter à ses mots.
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Liste complète filtrée (si on a des mots ID-match) */}
          {!loading && filteredInCategory.length > 0 && (
            <section className="space-y-3 mt-6">
              <h3 className="text-base font-semibold text-black/80">Tous les résultats</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredInCategory.map((w) => (
                  <WordCard
                    key={w.id}
                    w={w}
                    selected={selectedIds.has(w.id)}
                    onToggle={toggle}
                    disabled={alreadySelectedInCategory.has(w.id)}
                  />
                ))}
              </div>
            </section>
          )}

          <div className="h-24" />
        </div>
      </main>

      {/* CTA bas */}
      {!loading && (
        <div className="sticky bottom-0 z-30">
          <div className="mx-auto max-w-3xl px-5 pb-5">
            <div className="rounded-2xl bg-white shadow-2xl border border-black/5 p-3">
              <button
                onClick={handleSave}
                disabled={saving || selectedIds.size === 0 || !user?.id}
                className={[
                  "w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl shadow-md transition",
                  selectedIds.size > 0 && !saving && user?.id
                    ? "bg-[#3B82F6] text-white hover:scale-105 active:scale-95"
                    : "bg-black/10 text-black/40 cursor-not-allowed"
                ].join(" ")}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> {i18n.fr.saving}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" /> {i18n.fr.addSelection} ({selectedIds.size})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
