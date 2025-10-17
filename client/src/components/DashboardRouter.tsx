import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdminDashboard from "../pages/AdminDashboard";

/**
 * Composant qui redirige automatiquement vers le bon dashboard
 * selon si l'utilisateur est admin ou non
 */
export default function DashboardRouter() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      // Rediriger directement vers la page d'apprentissage
      navigate("/learn");
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">⏳ Chargement...</p>
        </div>
      </div>
    );
  }

  // Admin → AdminDashboard
  // User → Redirige vers /course
  return isAdmin ? <AdminDashboard /> : null;
}


