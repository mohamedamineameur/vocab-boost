import { useAuth } from "../contexts/AuthContext";
import AdminDashboard from "../pages/AdminDashboard";
import EnhancedDashboard from "../pages/EnhancedDashboard";

/**
 * Composant qui redirige automatiquement vers le bon dashboard
 * selon si l'utilisateur est admin ou non
 */
export default function DashboardRouter() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">⏳ Chargement...</p>
      </div>
    );
  }

  // Admin → AdminDashboard
  // User → EnhancedDashboard
  return isAdmin ? <AdminDashboard /> : <EnhancedDashboard />;
}

