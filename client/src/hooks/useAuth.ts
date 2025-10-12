import { useEffect, useState } from "react";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a un cookie de session
    const checkAuth = () => {
      const hasSession = document.cookie.includes("session=");
      setIsAuthenticated(hasSession);
    };

    // Vérifier immédiatement
    checkAuth();

    // Vérifier après un petit délai pour s'assurer que les cookies sont chargés
    const timeout = setTimeout(checkAuth, 100);

    // Vérifier périodiquement si l'authentification change
    const interval = setInterval(checkAuth, 2000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return { isAuthenticated };
};

