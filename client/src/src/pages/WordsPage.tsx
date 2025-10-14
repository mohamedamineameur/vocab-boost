// src/pages/WordsPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Search, BookOpen, ChevronRight, Tag, Inbox, Languages, Volume2, Loader2 } from "lucide-react";
import { getUserWords } from "../../services/user-word.services";
import { getWords } from "../../services/word.services";
import { useTranslate } from "../contexts/TranslateContext";
import { getProfiles } from "../../services/profile.services";
import { getAudio } from "../../services/audio.services";

// Type profil léger (ne pas importer les modèles Sequelize côté frontend)
type ProfileLite = {
  id?: string;
  userId?: string;
  local?: "en" | "fr" | "es" | "ar";
  theme?: "light" | "dark";
};

type Level =
  | "beginnerLevelOne"
  | "beginnerLevelTwo"
  | "intermediateLevelOne"
  | "intermediateLevelTwo"
  | "advancedLevelOne"
  | "advancedLevelTwo";

type Word = {
  id: string;
  text: string;
  meaning: string;
  example?: string;
  categoryId: string | null;
  pronunciation?: string; // ← phonétique
  frTranslation?: string;
  esTranslation?: string;
  arTranslation?: string;
  level?: Level;
  synonyms?: string[];
  antonyms?: string[];
  lexicalField?: string[];
  category?: { id: string; name: string; frTranslation?: string } | null;
};

type UserWord = {
  id?: string;
  userId?: string;
  wordId?: string;
  word_id?: string;
  isLearned?: boolean;
  word?: Word;
};

const i18n = {
  fr: {
    title: "Mes mots",
    searchPlaceholder: "Rechercher un mot…",
    emptyTitle: "Aucun mot sélectionné",
    emptySubtitle: "Ajoute des mots depuis tes catégories.",
    goToCategories: "Choisir des catégories",
    total: "Total",
    translation: "Traduction",
    listenWord: "Écouter le mot",
    listenTranslation: "Écouter la traduction",
  },
  en: {
    title: "My words",
    searchPlaceholder: "Search a word…",
    emptyTitle: "No words yet",
    emptySubtitle: "Add words from your categories.",
    goToCategories: "Pick categories",
    total: "Total",
    translation: "Translation",
    listenWord: "Listen to word",
    listenTranslation: "Listen to translation",
  },
  es: {
    title: "Mis palabras",
    searchPlaceholder: "Buscar una palabra…",
    emptyTitle: "Aún no hay palabras",
    emptySubtitle: "Añade palabras desde tus categorías.",
    goToCategories: "Elegir categorías",
    total: "Total",
    translation: "Traducción",
    listenWord: "Escuchar la palabra",
    listenTranslation: "Escuchar la traducción",
  },
  ar: {
    title: "كلماتي",
    searchPlaceholder: "ابحث عن كلمة…",
    emptyTitle: "لا توجد كلمات بعد",
    emptySubtitle: "أضف كلمات من فئاتك.",
    goToCategories: "اختيار الفئات",
    total: "المجموع",
    translation: "الترجمة",
    listenWord: "استمع إلى الكلمة",
    listenTranslation: "استمع إلى الترجمة",
  },
};

const asArray = <T,>(v: unknown): T[] => {
  if (Array.isArray(v)) return v;
  const keys = ["data", "rows", "items", "results", "userWords", "words", "profiles"];
  const vObj = v as Record<string, unknown>;
  for (const k of keys) if (Array.isArray(vObj?.[k])) return vObj[k] as T[];
  return [];
};

const norm = (s?: string) => (s ?? "").toLowerCase().trim();

// Normalise l’affichage phonétique: ajoute /.../ si absent
const formatPronunciation = (p?: string) => {
  if (!p) return "";
  let s = p.trim();
  if (!s) return "";
  const starts = s.startsWith("/") || s.startsWith("[");
  const ends = s.endsWith("/") || s.endsWith("]");
  if (starts && ends) return s;
  s = s.replace(/^\/|\/$/g, ""); // retire slashes doubles si fournis
  return `/${s}/`;
};

type Lang = "en" | "fr" | "es" | "ar";
const getWordTranslation = (w: Word, lang: Lang): string | undefined => {
  switch (lang) {
    case "fr": return w.frTranslation || undefined;
    case "es": return w.esTranslation || undefined;
    case "ar": return w.arTranslation || undefined;
    case "en":
    default:
      // Hypothèse: le mot source est en anglais
      return w.text || undefined;
  }
};

export default function WordsPage() {
  const { language } = useTranslate();
  const t = (i18n as Record<string, typeof i18n.fr>)[language] ?? i18n.fr;
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [userWords, setUserWords] = useState<UserWord[]>([]);
  const [allWords, setAllWords] = useState<Word[]>([]);

  // Audio player partagé + cache
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [audioCache] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [uwRes, wordsRes, profilesRes] = await Promise.all([
          getUserWords(),
          getWords(),
          getProfiles(),
        ]);

        if (!mounted) return;
        setUserWords(asArray<UserWord>(uwRes));
        setAllWords(asArray<Word>(wordsRes));
        setProfiles(asArray<ProfileLite>(profilesRes));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const profileLang: Lang = useMemo(
    () => ((profiles?.[0]?.local as Lang) ?? "en"),
    [profiles]
  );

  // Map id -> Word
  const wordById = useMemo(() => {
    const map = new Map<string, Word>();
    for (const w of allWords) map.set(w.id, w);
    return map;
  }, [allWords]);

  // Liste de mots pour l'utilisateur
  const wordsForUser: Word[] = useMemo(() => {
    const out: Word[] = [];
    const seen = new Set<string>();
    for (const uw of userWords) {
      const id = (uw.word?.id || uw.wordId || uw.word_id) ?? "";
      if (!id || seen.has(id)) continue;
      const w = uw.word ?? wordById.get(id);
      if (w) {
        out.push(w);
        seen.add(id);
      }
    }
    return out;
  }, [userWords, wordById]);

  // Recherche (ajout de pronunciation)
  const filtered = useMemo(() => {
    const q = norm(query);
    if (!q) return wordsForUser;
    return wordsForUser.filter((w) => {
      const bag = [
        w.text,
        w.meaning,
        w.example,
        w.pronunciation,        // ← recherche sur la phonétique
        w.frTranslation,
        w.esTranslation,
        w.arTranslation,
        ...(w.synonyms ?? []),
        ...(w.lexicalField ?? []),
      ]
        .filter(Boolean)
        .map((x) => norm(String(x)));
      return bag.some((s) => s.includes(q));
    });
  }, [query, wordsForUser]);

  // Jouer / stopper un audio (mot ou traduction)
  const playText = async (key: string, text: string) => {
    try {
      if (!audioRef.current) audioRef.current = new Audio();
      const audio = audioRef.current;

      if (playingKey === key && !audio.paused) {
        audio.pause();
        setPlayingKey(null);
        return;
      }

      let url = audioCache.get(key);
      if (!url) {
        setLoadingKey(key);
        url = await getAudio(text);
        if (url) {
          audioCache.set(key, url);
          setLoadingKey(null);
        } else {
          throw new Error("Failed to generate audio URL");
        }
      }

      if (!audio.paused) {
        audio.pause();
      }
      
      audio.src = url;
      await audio.play();
      setPlayingKey(key);
      audio.onended = () => {
        setPlayingKey(null);
      };
    } catch  {
      setLoadingKey(null);
      setPlayingKey(null);
    }
  };

  // Cleanup audio et blobs
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      audioCache.forEach((u) => URL.revokeObjectURL(u));
      audioCache.clear();
    };
  }, [audioCache]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F3F4F6]">
        <div className="max-w-xl mx-auto px-5 py-8">
          <header className="mb-6">
            <div className="h-6 w-40 rounded bg-black/10 animate-pulse" />
            <div className="mt-2 h-4 w-64 rounded bg-black/10 animate-pulse" />
          </header>
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
                <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-black/5 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const count = wordsForUser.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F3F4F6]">
      <div className="max-w-xl mx-auto px-5 py-8">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#111827]">{t.title}</h1>
            <p className="text-sm text-black/60">
              {t.total}: <span className="font-semibold text-[#111827]">{count}</span>
            </p>
          </div>
          <div className="text-xs text-black/50 inline-flex items-center gap-1">
            <Languages className="h-4 w-4" />
            <span className="uppercase">{(profiles?.[0]?.local as Lang) ?? "en"}</span>
          </div>
        </header>

        {/* Search */}
        <div className="sticky top-0 z-10 -mx-5 px-5 py-3 bg-gradient-to-b from-white/95 to-white/0 backdrop-blur">
          <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#3B82F6]">
            <Search className="h-5 w-5 text-[#3B82F6]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-transparent outline-none text-base"
              aria-label={t.searchPlaceholder}
            />
          </div>
        </div>

        {/* Empty state */}
        {count === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-2 h-12 w-12 rounded-2xl bg-[#F3F4F6] flex items-center justify-center">
              <Inbox className="h-6 w-6 text-black/40" />
            </div>
            <h2 className="text-base font-semibold text-[#111827]">{t.emptyTitle}</h2>
            <p className="mt-1 text-sm text-black/60">{t.emptySubtitle}</p>
            <button
              onClick={() => navigate("/categories")}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-4 py-2 text-white shadow-md hover:opacity-90 active:scale-95 transition"
            >
              <Tag className="h-4 w-4" /> {t.goToCategories}
            </button>
          </div>
        )}

        {/* List */}
        {count > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-3">
            {filtered.map((w) => {
              const catName = w.category?.frTranslation || w.category?.name || undefined;

              const translation = getWordTranslation(w, profileLang);
              const keySrc = `src:${w.id}`;
              const keyTr  = `tr:${w.id}:${profileLang}`;

              const isLoadingSrc = loadingKey === keySrc;
              const isPlayingSrc = playingKey === keySrc;
              const isLoadingTr  = loadingKey === keyTr;
              const isPlayingTr  = playingKey === keyTr;

              return (
                <div
                  key={w.id}
                  className="group w-full rounded-2xl border border-black/10 bg-white p-4 shadow-sm hover:shadow-md hover:border-[#22C55E]/30 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-11 w-11 rounded-xl bg-[#F3F4F6] flex items-center justify-center shrink-0">
                        <BookOpen className="text-[#22C55E]" />
                      </div>
                      <div className="min-w-0">
                        {/* Titre + catégorie + bouton écouter mot */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/quiz-flow/${w.id}`)}
                            className="text-left"
                            title={w.text}
                          >
                            <h3 className="text-base font-semibold text-[#111827] truncate">
                              {w.text}
                            </h3>
                          </button>

                          {catName && (
                            <span className="shrink-0 rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] text-[#111827]/80">
                              {catName}
                            </span>
                          )}

                          <button
                            onClick={() => playText(keySrc, w.text)}
                            className="ml-1 inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-2 py-1 text-xs text-[#111827] hover:bg-black/5 active:scale-95"
                            aria-label={t.listenWord}
                            title={t.listenWord}
                          >
                            {isLoadingSrc ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Volume2 className={`h-4 w-4 ${isPlayingSrc ? "text-[#22C55E]" : "text-black/70"}`} />
                            )}
                          </button>
                        </div>

                        {/* Phonétique */}
                        {w.pronunciation && (
                          <div className="mt-0.5 text-xs text-black/60 font-mono">
                            {formatPronunciation(w.pronunciation)}
                          </div>
                        )}

                        {/* Sens / définition */}
                        <p className="mt-0.5 text-sm text-black/70 line-clamp-2">
                          {w.meaning}
                        </p>

                        {/* Traduction + bouton écouter */}
                        {translation && (
                          <p className="mt-1 text-sm text-[#111827] flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px]">
                              <Languages className="h-3 w-3" />
                              <span className="uppercase">{profileLang}</span>
                            </span>
                            <span className="truncate">{translation}</span>
                            <button
                              onClick={() => playText(keyTr, translation)}
                              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-2 py-1 text-xs text-[#111827] hover:bg-black/5 active:scale-95"
                              aria-label={t.listenTranslation}
                              title={t.listenTranslation}
                            >
                              {isLoadingTr ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Volume2 className={`h-4 w-4 ${isPlayingTr ? "text-[#3B82F6]" : "text-black/70"}`} />
                              )}
                            </button>
                          </p>
                        )}

                        {/* Exemple */}
                        {w.example && (
                          <p className="mt-1 text-xs text-black/50 italic line-clamp-1">
                            “{w.example}”
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/quiz-flow/${w.id}`)}
                      className="shrink-0"
                      aria-label="Ouvrir le quiz"
                      title="Ouvrir le quiz"
                    >
                      <ChevronRight className="h-5 w-5 text-black/40 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
