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
  // Valeur non-tableau ignorée
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
          // Données chargées avec succès
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
    // Redirection vers home
    return <Navigate to="/home" replace />;
  }

  if (!skipProfileCheck && profiles.length === 0) {
    // Redirection vers profile
    return <Navigate to="/profile" replace />;
  }

  if (!skipCategoryCheck && userCategories.length === 0) {
    // Redirection vers categories
    return <Navigate to="/categories" replace />;
  }

  // Toutes les vérifications passées
  return children;
}
