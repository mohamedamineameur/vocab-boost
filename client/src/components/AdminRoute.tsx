import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3B82F6] via-[#60A5FA] to-[#22C55E] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <p className="text-white dark:text-gray-200">⏳ Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}


