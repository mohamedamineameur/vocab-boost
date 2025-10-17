import { useState, useEffect } from "react";
import { getUserSessions, revokeSession } from "../services/session.services";
import { Monitor, Smartphone, Trash2, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Session {
  id: string;
  userId: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
  user?: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
  };
}

const tr = {
  fr: {
    title: "Gérer mes sessions",
    subtitle: "Sécurisez votre compte en révoquant les sessions suspectes",
    currentSession: "Session actuelle",
    activeSession: "Session active",
    revokeButton: "Révoquer",
    revoking: "Révocation...",
    revoked: "Révoquée",
    loading: "Chargement...",
    error: "Erreur lors du chargement",
    noSessions: "Aucune session active",
    createdAt: "Créée le",
    expiresAt: "Expire le",
    device: "Appareil",
    location: "IP",
    revokeSuccess: "Session révoquée avec succès",
  },
  en: {
    title: "Manage my sessions",
    subtitle: "Secure your account by revoking suspicious sessions",
    currentSession: "Current session",
    activeSession: "Active session",
    revokeButton: "Revoke",
    revoking: "Revoking...",
    revoked: "Revoked",
    loading: "Loading...",
    error: "Error loading sessions",
    noSessions: "No active sessions",
    createdAt: "Created on",
    expiresAt: "Expires on",
    device: "Device",
    location: "IP",
    revokeSuccess: "Session revoked successfully",
  },
  ar: {
    title: "إدارة جلساتي",
    subtitle: "قم بتأمين حسابك عن طريق إلغاء الجلسات المشبوهة",
    currentSession: "الجلسة الحالية",
    activeSession: "جلسة نشطة",
    revokeButton: "إلغاء",
    revoking: "جاري الإلغاء...",
    revoked: "ملغاة",
    loading: "جاري التحميل...",
    error: "خطأ في تحميل الجلسات",
    noSessions: "لا توجد جلسات نشطة",
    createdAt: "تم الإنشاء في",
    expiresAt: "تنتهي في",
    device: "الجهاز",
    location: "IP",
    revokeSuccess: "تم إلغاء الجلسة بنجاح",
  },
  es: {
    title: "Administrar mis sesiones",
    subtitle: "Asegura tu cuenta revocando sesiones sospechosas",
    currentSession: "Sesión actual",
    activeSession: "Sesión activa",
    revokeButton: "Revocar",
    revoking: "Revocando...",
    revoked: "Revocada",
    loading: "Cargando...",
    error: "Error al cargar las sesiones",
    noSessions: "No hay sesiones activas",
    createdAt: "Creada el",
    expiresAt: "Expira el",
    device: "Dispositivo",
    location: "IP",
    revokeSuccess: "Sesión revocada con éxito",
  },
} as const;

const getDeviceIcon = (userAgent: string) => {
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    return <Smartphone className="w-5 h-5" />;
  }
  return <Monitor className="w-5 h-5" />;
};

const getDeviceName = (userAgent: string) => {
  const ua = userAgent.toLowerCase();
  
  // Navigateurs
  let browser = "Unknown";
  if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("edg")) browser = "Edge";
  
  // OS
  let os = "";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
  
  return os ? `${browser} sur ${os}` : browser;
};

const formatDate = (dateString: string, locale: string) => {
  const date = new Date(dateString);
  return date.toLocaleString(locale === "ar" ? "ar-SA" : locale === "es" ? "es-ES" : locale === "en" ? "en-US" : "fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function SessionsPage() {
  const { language } = useTranslate();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const t = (key: keyof typeof tr["fr"]) =>
    tr[language as keyof typeof tr]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokedIds, setRevokedIds] = useState<Set<string>>(new Set());

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserSessions();
      setSessions(data.sessions || []);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message || t("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevoke = async (sessionId: string, isCurrent: boolean) => {
    if (!confirm(isCurrent ? "⚠️ Vous allez vous déconnecter. Continuer ?" : "Révoquer cette session ?")) {
      return;
    }

    setRevokingId(sessionId);
    try {
      await revokeSession(sessionId);
      setRevokedIds(prev => new Set(prev).add(sessionId));
      
      // Si c'est la session actuelle, rediriger vers login
      if (isCurrent) {
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        // Recharger la liste
        await loadSessions();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown }; message?: string };
      let message: string = t("error");
      
      if (error.response?.data) {
        const data = error.response.data as Record<string, unknown>;
        if (data.error) {
          const err = data.error as Record<string, string> | string;
          message = (typeof err === "object" ? (err[language] || err.en || JSON.stringify(err)) : err) as string;
        }
      }
      
      alert(message);
    } finally {
      setRevokingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F3F4F6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#3B82F6] mb-4" />
            <p className="text-[#111827]/60 dark:text-gray-300">{t("loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F3F4F6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-600 dark:text-red-400 mb-4" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F3F4F6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#111827] dark:text-white">
            {isAdmin ? "🛡️ Toutes les sessions" : t("title")}
          </h1>
          <p className="text-[#111827]/60 dark:text-gray-300 mt-2">
            {isAdmin ? `${sessions.length} sessions actives sur la plateforme` : t("subtitle")}
          </p>
        </header>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#F3F4F6] dark:border-gray-700 p-8 text-center">
            <p className="text-[#111827]/60 dark:text-gray-300">{t("noSessions")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isRevoked = revokedIds.has(session.id);
              const isRevoking = revokingId === session.id;
              
              return (
                <div
                  key={session.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-6 transition ${
                    session.isCurrent
                      ? "border-[#3B82F6] ring-2 ring-[#3B82F6]/20 dark:ring-[#3B82F6]/30"
                      : "border-[#F3F4F6] dark:border-gray-700"
                  } ${isRevoked ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Informations */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        session.isCurrent ? "bg-[#3B82F6]/10 text-[#3B82F6]" : "bg-[#F3F4F6] dark:bg-gray-700 text-[#111827] dark:text-white"
                      }`}>
                        {getDeviceIcon(session.userAgent)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-[#111827] dark:text-white">
                            {getDeviceName(session.userAgent)}
                          </h3>
                          {session.isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3B82F6] text-white text-xs font-semibold">
                              <CheckCircle className="w-3 h-3" />
                              {t("currentSession")}
                            </span>
                          )}
                        </div>
                        
                        {/* Afficher l'utilisateur si admin */}
                        {isAdmin && session.user && (
                          <div className="mb-2 text-sm">
                            <span className="font-medium text-[#111827] dark:text-white">👤 Utilisateur: </span>
                            <span className="text-[#111827]/70 dark:text-gray-300">
                              {session.user.firstname} {session.user.lastname} ({session.user.email})
                            </span>
                          </div>
                        )}
                        
                        <div className="space-y-1 text-sm text-[#111827]/60 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{t("location")}:</span>
                            <span className="font-mono text-xs">{session.ip}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{t("createdAt")}:</span>
                            <span>{formatDate(session.createdAt, language)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{t("expiresAt")}:</span>
                            <span>{formatDate(session.expiresAt, language)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => handleRevoke(session.id, session.isCurrent)}
                      disabled={isRevoking || isRevoked}
                      className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                        isRevoked
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          : session.isCurrent
                          ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                          : "bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                      }`}
                    >
                      {isRevoking ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t("revoking")}
                        </>
                      ) : isRevoked ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          {t("revoked")}
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          {t("revokeButton")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

