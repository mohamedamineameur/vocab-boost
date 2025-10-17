import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getProfile, updateProfile } from '../services/profile.services';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('light');
  const [loading, setLoading] = useState(true);

  // Appliquer le thème au chargement initial
  useEffect(() => {
    const loadTheme = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const profileData = await getProfile();
        const profile = Array.isArray(profileData) ? profileData[0] : profileData;
        if (profile?.theme) {
          setThemeState(profile.theme);
          applyTheme(profile.theme);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du thème:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, [user]);

  // Appliquer le thème immédiatement quand il change
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (newTheme: Theme) => {
    const htmlElement = document.documentElement;
    
    if (newTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    
    // Vérification
  };

  const setTheme = async (newTheme: Theme) => {
    if (!user?.id) return;
    
    
    try {
      // Mettre à jour l'état immédiatement pour un changement instantané
      setThemeState(newTheme);
      
      // Sauvegarder dans le backend
      await updateProfile({
        theme: newTheme
      });
      
      
      // Recharger le profil pour vérifier la synchronisation
      const profileData = await getProfile();
      const profile = Array.isArray(profileData) ? profileData[0] : profileData;
      
      if (profile?.theme && profile.theme !== newTheme) {
        // Si le backend a retourné un thème différent, l'appliquer
        setThemeState(profile.theme);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du thème:", error);
      // En cas d'erreur, on pourrait restaurer le thème précédent
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

