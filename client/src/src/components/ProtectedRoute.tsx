// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getProfiles } from "../../services/profile.services";
import { getUserCategories } from "../../services/user-category.services";
import { useEffect, useState, type ReactNode } from "react";

// 🛠️ Utilitaire pour fiabiliser la lecture des tableaux renvoyés par l'API
const asArray = (v: unknown) => {
  // Si c'est déjà un tableau, on le retourne
  if (Array.isArray(v)) return v;
  
  // Si c'est un objet, on cherche dans les clés communes
  if (v && typeof v === 'object') {
    const vObj = v as Record<string, unknown>;
    const keys = ["data", "rows", "items", "results", "userCategories", "categories", "profiles"];
    for (const k of keys) {
      if (Array.isArray(vObj[k])) return vObj[k];
    }
  }
  
  // Sinon on retourne un tableau vide
  console.warn("⚠️ asArray: valeur non-tableau reçue:", v);
  return [];
};

export function ProtectedRoute({
  children,
  skipProfileCheck = false,
  skipCategoryCheck = false,
}: {
  children: ReactNode;
  skipProfileCheck?: boolean;   // ➡️ utile pour la page /profile
  skipCategoryCheck?: boolean;  // ➡️ utile pour la page /categories
}) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  const [profiles, setProfiles] = useState<Array<{ id: string; [key: string]: unknown }>>([]);
  const [userCategories, setUserCategories] = useState<Array<{ id: string; [key: string]: unknown }>>([]);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      setChecking(false);
      return;
    }
    
    let cancelled = false;
    setChecking(true);
    
    const fetchData = async () => {
      try {
        const [p, uc] = await Promise.all([getProfiles(), getUserCategories()]);
        
        if (!cancelled) {
          const profilesArray = asArray(p);
          const userCategoriesArray = asArray(uc);
          
          setProfiles(profilesArray);
          setUserCategories(userCategoriesArray);

          // 🔍 Debug pour vérifier
          console.log("✅ Profiles brut:", p);
          console.log("✅ Profiles array:", profilesArray, "Length:", profilesArray.length);
          console.log("✅ UserCategories brut:", uc);
          console.log("✅ UserCategories array:", userCategoriesArray, "Length:", userCategoriesArray.length);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("❌ ProtectedRoute fetch error:", e);
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, location.pathname]);

  if (loading || checking) {
    return <p className="text-center text-white">⏳ Chargement...</p>;
  }

  if (!isLoggedIn) {
    console.log("🚫 Not logged in → redirecting to /home");
    return <Navigate to="/home" replace />;
  }

  if (!skipProfileCheck && profiles.length === 0) {
    console.log("👤 No profile found → redirecting to /profile");
    return <Navigate to="/profile" replace />;
  }

  if (!skipCategoryCheck && userCategories.length === 0) {
    console.log("🏷️ No categories found → redirecting to /categories");
    return <Navigate to="/categories" replace />;
  }

  console.log("✅ ProtectedRoute: All checks passed, rendering children");
  return children;
}
