import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { me, destroySession } from "../../services/user.services"; // ⚡ ajoute destroySession

interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  isAdmin: boolean;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const data = await me(); 
      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await destroySession(); 
    } catch (err) {
      console.error("Erreur lors de la destruction de session", err);
    } finally {
      setUser(null); 
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: !!user,
        isAdmin: user?.isAdmin ?? false,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
