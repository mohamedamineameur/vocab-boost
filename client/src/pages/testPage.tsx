import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Search,
  Tag,
  Loader2,
  PlusCircle,
  ChevronRight,
  Sparkles,
  Home,
  BookOpen,
  User
} from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { useAuth } from "../contexts/AuthContext";

import { getCategories } from "../services/category.services";
import { getUserCategories, createUserCategory } from "../services/user-category.services";

// --- Types ---
export type Category = {
  id: string;
  name: string;
  description?: string;
  frTranslation?: string;
  esTranslation?: string;
  arTranslation?: string;
};

export type UserCategory = {
  id?: string;
  userId?: string;
  categoryId?: string;
  category_id?: string;
  category?: Category;
};

// --- i18n ---
const i18n = {
  fr: {
    title: "Choisis tes catégories",
    subtitle: "Personnalise ton apprentissage",
    searchPlaceholder: "Rechercher une catégorie…",
    noneYetTitle: "Aucune catégorie sélectionnée",
    noneYetSubtitle: "Sélectionne au moins une catégorie pour commencer",
    confirm: "Confirmer la sélection",
    saving: "Enregistrement…",
    saved: "Catégories enregistrées !",
    yourCats: "Tes catégories",
    change: "Modifier",
    emptyResults: "Aucun résultat",
    bottomHint: "1 action principale par écran : confirme quand tu es prêt(e)."
  },
  en: {
    title: "Pick your categories",
    subtitle: "Personalize your learning",
    searchPlaceholder: "Search a category…",
    noneYetTitle: "No categories yet",
    noneYetSubtitle: "Select at least one category to get started",
    confirm: "Confirm selection",
    saving: "Saving…",
    saved: "Categories saved!",
    yourCats: "Your categories",
    change: "Edit",
    emptyResults: "No results",
    bottomHint: "One primary action per screen: confirm when ready."
  },
  es: {
    title: "Elige tus categorías",
    subtitle: "Personaliza tu aprendizaje",
    searchPlaceholder: "Buscar una categoría…",
    noneYetTitle: "Aún no hay categorías",
    noneYetSubtitle: "Selecciona al menos una categoría para empezar",
    confirm: "Confirmar selección",
    saving: "Guardando…",
    saved: "¡Categorías guardadas!",
    yourCats: "Tus categorías",
    change: "Editar",
    emptyResults: "Sin resultados",
    bottomHint: "Una acción principal por pantalla: confirma cuando estés listo."
  },
  ar: {
    title: "اختر فئاتك",
    subtitle: "خصّص تعلّمك",
    searchPlaceholder: "ابحث عن فئة…",
    noneYetTitle: "لا توجد فئات بعد",
    noneYetSubtitle: "اختر فئة واحدة على الأقل للبدء",
    confirm: "تأكيد الاختيار",
    saving: "جارٍ الحفظ…",
    saved: "تم حفظ الفئات!",
    yourCats: "فئاتك",
    change: "تعديل",
    emptyResults: "لا نتائج",
    bottomHint: "إجراء أساسي واحد لكل شاشة: أكّد عندما تكون جاهزًا."
  }
};

function useI18n() {
  const { language } = useTranslate();
  return {
    t: (key: keyof typeof i18n["fr"]) => i18n[language]?.[key] ?? i18n.en[key],
    language
  } as const;
}

// --- Utils ---
// ⛑️ Rend robuste les différents formats de réponses
const asArray = <T,>(v: unknown): T[] => {
  if (Array.isArray(v)) return v;
  const keys = ["data", "rows", "items", "results", "userCategories", "categories"];
  const vObj = v as Record<string, unknown>;
  for (const k of keys) {
    if (Array.isArray(vObj?.[k])) return vObj[k] as T[];
  }
  return [];
};

const getLabelFor = (c: Category, lang: string) => {
  if (!c) return "";
  switch (lang) {
    case "fr":
      return c.frTranslation || c.name;
    case "es":
      return c.esTranslation || c.name;
    case "ar":
      return c.arTranslation || c.name;
    default:
      return c.name;
  }
};

// --- Carte catégorie ---
function CategoryCard({
  category,
  label,
  selected,
  onToggle
}: {
  category: Category;
  label: string;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(category.id)}
      aria-pressed={selected}
      className={[
        "group relative w-full text-left p-4 rounded-2xl shadow-md",
        "transition transform hover:scale-[1.02] active:scale-[0.98]",
        selected
          ? "bg-[#22C55E] text-white"
          : "bg-white dark:bg-gray-800 text-[#111827] border border-[#E5E7EB]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm",
            selected ? "bg-white dark:bg-gray-800/20" : "bg-[#F3F4F6]"
          ].join(" ")}
        >
          <Tag className={selected ? "text-white" : "text-[#3B82F6]"} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold line-clamp-1">{label}</h3>
            {selected && <CheckCircle2 className="h-5 w-5 text-white drop-shadow" />}
          </div>
          {category.description && (
            <p className={["mt-1 text-sm line-clamp-2", selected ? "text-white/90" : "text-black/70"].join(" ")}>
              {category.description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}



// --- PAGE PRINCIPALE ---
export default function CategorySelectionPage() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [justSaved, setJustSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  // IDs des catégories déjà choisies (DB)
  const alreadySelectedIds = useMemo(() => {
    return new Set(
      userCategories
        .map((uc: UserCategory) => uc.categoryId || uc.category_id || uc.category?.id)
        .filter(Boolean) as string[]
    );
  }, [userCategories]);

  const hasAnyUserCategories = alreadySelectedIds.size > 0;

  // Catégories restantes à proposer (non en DB)
  const availableForSelection = useMemo(() => {
    return categories.filter((c) => !alreadySelectedIds.has(c.id));
  }, [categories, alreadySelectedIds]);

  // Filtrage par recherche (sur la liste affichée)
  const listToShow = useMemo(() => {
    const base = editing || !hasAnyUserCategories ? availableForSelection : [];
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((c) => {
      const hay = [
        c.name,
        c.description,
        c.frTranslation,
        c.esTranslation,
        c.arTranslation
      ]
        .filter(Boolean)
        .map((x) => String(x).toLowerCase());
      return hay.some((s) => s.includes(q));
    });
  }, [availableForSelection, editing, hasAnyUserCategories, query]);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [cats, uCats] = await Promise.all([getCategories(), getUserCategories()]);

        if (!mounted) return;

        const catsArr = asArray<Category>(cats);
        const uCatsArr = asArray<UserCategory>(uCats);

        setCategories(catsArr);
        setUserCategories(uCatsArr);

        // 🪵 Aide debug locale (à retirer en prod)
      } catch (e: unknown) {
        const error = e as { message?: string };
        setError(error?.message || "Failed to load data");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [justSaved]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

 const handleConfirm = async () => {
  try {
    setSaving(true);
    setError(null);
    const toCreate = Array.from(selectedIds).filter((id) => !alreadySelectedIds.has(id));
    if (toCreate.length > 0 && user?.id) {
      const payloads = toCreate.map((categoryId) => ({
        categoryId,
        userId: user.id,
      }));
      await Promise.all(payloads.map((p) => createUserCategory(p)));
    }
    setJustSaved(true);
    
    // 🔥 Recharge les deux sources pour être sûr
    const [cats, uCats] = await Promise.all([getCategories(), getUserCategories()]);
    setCategories(asArray<Category>(cats));
    setUserCategories(asArray<UserCategory>(uCats));
    
    setSelectedIds(new Set());
    setEditing(false);
  } catch (e: unknown) {
    const error = e as { message?: string };
    setError(error?.message || "Failed to save");
  } finally {
    setSaving(false);
  }
};


  const startEditing = () => {
    setSelectedIds(new Set());
    setEditing(true);
  };

  const showPicker = (!loading && !hasAnyUserCategories) || editing;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#F3F4F6] text-[#111827]">
      {/* Header */}
      <header className="px-5 pt-6 pb-3 sticky top-0 z-20 bg-white dark:bg-gray-800/80 backdrop-blur border-b border-black/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#111827]">{t("title")}</h1>
            <p className="text-sm text-black/60">{t("subtitle")}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-black/10 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-[#111827]"
          >
            <ChevronRight className="h-4 w-4 rotate-180" /> Back
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-5 py-5">
          {/* Barre de recherche si on affiche le picker */}
          {showPicker && (
            <div className="sticky top-[60px] z-10 py-3 bg-gradient-to-b from-white/90 to-white/0 backdrop-blur">
              <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#3B82F6]">
                <Search className="h-5 w-5 text-[#3B82F6]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full bg-transparent outline-none text-base"
                  aria-label={t("searchPlaceholder")}
                />
              </div>
            </div>
          )}

          {/* Etats de chargement / erreur */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#3B82F6]" />
              <p className="mt-3 text-black/70">Chargement…</p>
            </div>
          )}

          {error && (
            <div role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {String(error)}
            </div>
          )}

          {/* Mode normal : affiche les catégories déjà choisies */}
          {!loading && hasAnyUserCategories && !editing && (
            <section className="space-y-4">
              <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-md border border-black/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{t("yourCats")}</h2>
                  <button
                    onClick={startEditing}
                    className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm bg-[#3B82F6] text-white shadow-md hover:scale-105 active:scale-95 transition"
                  >
                    <PlusCircle className="h-4 w-4" /> {t("change")}
                  </button>
                </div>
             // ...
<div className="mt-4 flex flex-wrap gap-2">
  {Array.from(alreadySelectedIds).map((id) => {
    const cat = categories.find((c) => c.id === id);
    const label = cat ? getLabelFor(cat, language) : id;
    return (
      <button
        key={id}
        onClick={() => navigate(`/categories/${id}/words`)}
        className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-3 py-1 text-sm text-[#111827] hover:ring-2 hover:ring-[#3B82F6]/30 transition"
      >
        <Sparkles className="h-4 w-4 text-[#3B82F6]" /> {label}
      </button>
    );
  })}
</div>
// ...

              </div>
              <p className="text-sm text-black/60">{t("bottomHint")}</p>
            </section>
          )}

          {/* Sélecteur : si on édite OU si l'utilisateur n'a rien encore */}
          {showPicker && (
            <section className="mt-2">
              <div className="mb-4 rounded-2xl border border-black/5 bg-white dark:bg-gray-800 p-4 shadow-md"> 
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#22C55E]" />
                  {t("noneYetTitle")}
                </h2>
                <p className="mt-1 text-sm text-black/60">{t("noneYetSubtitle")}</p>
              </div>

              {listToShow.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-[#F3F4F6] p-6 text-center">
                  <p className="text-sm text-black/60">{t("emptyResults")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {listToShow.map((c) => (
                    <CategoryCard
                      key={c.id}
                      category={c}
                      label={getLabelFor(c, language)}
                      selected={selectedIds.has(c.id)}
                      onToggle={toggle}
                    />
                  ))}
                </div>
              )}

              {/* CTA collant uniquement quand on peut sélectionner */}
              <div className="h-24" />
            </section>
          )}
        </div>
      </main>

      {/* Bouton Confirmer quand on peut sélectionner */}
      {showPicker && (
        <div className="sticky bottom-0 z-30">
          <div className="mx-auto max-w-3xl px-5 pb-5">
            <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-black/5 p-3">
              <button
                onClick={handleConfirm}
                disabled={saving || selectedIds.size === 0 || !user?.id}
                className={[
                  "w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl shadow-md transition",
                  selectedIds.size > 0 && !saving && user?.id
                    ? "bg-[#3B82F6] text-white hover:scale-105 active:scale-95"
                    : "bg-black/10 text-black/40 cursor-not-allowed"
                ].join(" ")}
                aria-live="polite"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> {t("saving")}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" /> {t("confirm")} ({selectedIds.size})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {justSaved && (
        <div className="fixed inset-x-0 bottom-20 flex justify-center pointer-events-none">
          <div className="pointer-events-auto rounded-2xl bg-[#22C55E] text-white px-4 py-2 shadow-lg">{t("saved")}</div>
        </div>
      )}

      {/* Bottom Nav (optionnel) */}
      <nav className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-black/5 sm:hidden">
        <div className="mx-auto max-w-3xl grid grid-cols-3 text-center">
          <button className="py-3 flex flex-col items-center gap-1 text-xs text-black/70">
            <Home className="h-5 w-5 text-[#3B82F6]" /> Home
          </button>
          <button className="py-3 flex flex-col items-center gap-1 text-xs text-black/70">
            <BookOpen className="h-5 w-5 text-[#22C55E]" /> Learn
          </button>
          <button className="py-3 flex flex-col items-center gap-1 text-xs text-black/70">
            <User className="h-5 w-5" /> Me
          </button>
        </div>
      </nav>
    </div>
  );
}
