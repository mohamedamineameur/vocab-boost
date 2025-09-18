import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <p className="text-center text-white">⏳ Chargement...</p>;
  if (!isLoggedIn) return <Navigate to="/home" />; // redirige vers page publique

  return children;
}
