import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Trophy, Settings } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/learn", icon: Home, label: "Accueil" },
    { path: "/learn", icon: BookOpen, label: "Apprendre" },
    { path: "/words", icon: Trophy, label: "Progrès" },
    { path: "/settings", icon: Settings, label: "Paramètres" }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path === "/learn" && location.pathname.startsWith("/learn"));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center gap-1 flex-1 h-full
                transition-colors duration-200
                ${isActive ? "text-blue-600" : "text-gray-500"}
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-1 bg-blue-600 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

