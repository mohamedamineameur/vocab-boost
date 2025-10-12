import { useState, useEffect } from "react";
import { getAuditLogs, getAuditStats } from "../../services/audit-log.services";
import {
  Shield,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";

interface AuditLog {
  id: string;
  userId?: string;
  email?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ip: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
  };
}

interface AuditStats {
  totalLogs: number;
  successCount: number;
  failedCount: number;
  successRate: number;
  loginAttempts: number;
  failedLogins: number;
  failedLoginRate: number;
}

const tr = {
  fr: {
    title: "Logs d'Audit",
    subtitle: "Surveillance des actions de sécurité",
    stats: "Statistiques",
    logs: "Journaux",
    total: "Total",
    success: "Succès",
    failed: "Échecs",
    successRate: "Taux de réussite",
    loginAttempts: "Tentatives de connexion",
    failedLogins: "Connexions échouées",
    action: "Action",
    user: "Utilisateur",
    ip: "IP",
    date: "Date",
    status: "Statut",
    details: "Détails",
    noLogs: "Aucun log trouvé",
    loading: "Chargement...",
    search: "Rechercher...",
    filterByAction: "Filtrer par action",
    filterBySuccess: "Filtrer par statut",
    all: "Tous",
    successOnly: "Succès uniquement",
    failedOnly: "Échecs uniquement",
    previous: "Précédent",
    next: "Suivant",
  },
  en: {
    title: "Audit Logs",
    subtitle: "Security Actions Monitoring",
    stats: "Statistics",
    logs: "Logs",
    total: "Total",
    success: "Success",
    failed: "Failed",
    successRate: "Success Rate",
    loginAttempts: "Login Attempts",
    failedLogins: "Failed Logins",
    action: "Action",
    user: "User",
    ip: "IP",
    date: "Date",
    status: "Status",
    details: "Details",
    noLogs: "No logs found",
    loading: "Loading...",
    search: "Search...",
    filterByAction: "Filter by action",
    filterBySuccess: "Filter by status",
    all: "All",
    successOnly: "Success only",
    failedOnly: "Failed only",
    previous: "Previous",
    next: "Next",
  },
  ar: {
    title: "سجلات المراجعة",
    subtitle: "مراقبة الإجراءات الأمنية",
    stats: "إحصائيات",
    logs: "السجلات",
    total: "المجموع",
    success: "نجح",
    failed: "فشل",
    successRate: "معدل النجاح",
    loginAttempts: "محاولات تسجيل الدخول",
    failedLogins: "عمليات تسجيل دخول فاشلة",
    action: "الإجراء",
    user: "المستخدم",
    ip: "IP",
    date: "التاريخ",
    status: "الحالة",
    details: "التفاصيل",
    noLogs: "لم يتم العثور على سجلات",
    loading: "جاري التحميل...",
    search: "بحث...",
    filterByAction: "تصفية حسب الإجراء",
    filterBySuccess: "تصفية حسب الحالة",
    all: "الكل",
    successOnly: "النجاحات فقط",
    failedOnly: "الفشل فقط",
    previous: "السابق",
    next: "التالي",
  },
  es: {
    title: "Registros de Auditoría",
    subtitle: "Monitoreo de Acciones de Seguridad",
    stats: "Estadísticas",
    logs: "Registros",
    total: "Total",
    success: "Éxito",
    failed: "Fallido",
    successRate: "Tasa de éxito",
    loginAttempts: "Intentos de inicio de sesión",
    failedLogins: "Inicios de sesión fallidos",
    action: "Acción",
    user: "Usuario",
    ip: "IP",
    date: "Fecha",
    status: "Estado",
    details: "Detalles",
    noLogs: "No se encontraron registros",
    loading: "Cargando...",
    search: "Buscar...",
    filterByAction: "Filtrar por acción",
    filterBySuccess: "Filtrar por estado",
    all: "Todos",
    successOnly: "Solo éxitos",
    failedOnly: "Solo fallos",
    previous: "Anterior",
    next: "Siguiente",
  },
} as const;

const actionLabels: Record<string, string> = {
  LOGIN_SUCCESS: "Connexion réussie",
  LOGIN_FAILED: "Connexion échouée",
  MFA_SENT: "Code MFA envoyé",
  MFA_VERIFIED: "MFA vérifié",
  MFA_FAILED: "MFA échoué",
  LOGOUT: "Déconnexion",
  SESSION_REVOKED: "Session révoquée",
  USER_CREATED: "Utilisateur créé",
  USER_DELETED: "Utilisateur supprimé",
  EMAIL_VERIFIED: "Email vérifié",
  EMAIL_VERIFICATION_RESENT: "Email de vérification renvoyé",
  PASSWORD_CHANGED: "Mot de passe modifié",
  PASSWORD_RESET_REQUESTED: "Réinitialisation demandée",
  PASSWORD_RESET_COMPLETED: "Réinitialisation complétée",
  EMAIL_CHANGED: "Email modifié",
  PROFILE_UPDATED: "Profil mis à jour",
  ADMIN_USER_DELETED: "Utilisateur supprimé (Admin)",
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default function AuditLogsPage() {
  const { language } = useTranslate();
  const t = (key: keyof typeof tr["fr"]) =>
    tr[language as keyof typeof tr]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    action: "",
    success: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
  });

  const loadLogs = async () => {
    try {
      setLoading(true);

      const params: Record<string, unknown> = {
        limit: pagination.limit,
        offset: pagination.offset,
      };

      if (filter.action) params.action = filter.action;
      if (filter.success) params.success = filter.success;

      const [logsData, statsData] = await Promise.all([
        getAuditLogs(params),
        getAuditStats(),
      ]);

      setLogs(logsData.logs || []);
      setPagination((prev) => ({ ...prev, total: logsData.pagination?.total || 0 }));
      setStats(statsData.stats || null);
    } catch {
      // Silently ignore errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [pagination.offset, filter.action, filter.success]);

  const filteredLogs = logs.filter((log) => {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        log.email?.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.ip.includes(searchLower) ||
        log.user?.email?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination((prev) => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit),
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination((prev) => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  if (loading && !logs.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F3F4F6]" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#3B82F6] mb-4" />
            <p className="text-[#111827]/60">{t("loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F3F4F6]" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-[#3B82F6]" />
            <h1 className="text-3xl font-bold text-[#111827]">{t("title")}</h1>
          </div>
          <p className="text-[#111827]/60">{t("subtitle")}</p>
        </header>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-[#3B82F6]" />
                <span className="text-sm text-[#111827]/60">{t("total")}</span>
              </div>
              <div className="text-2xl font-bold text-[#111827]">{stats.totalLogs}</div>
            </div>

            <div className="bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                <span className="text-sm text-[#111827]/60">{t("success")}</span>
              </div>
              <div className="text-2xl font-bold text-[#22C55E]">{stats.successCount}</div>
              <div className="text-xs text-[#111827]/50 mt-1">{stats.successRate}%</div>
            </div>

            <div className="bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-[#111827]/60">{t("failed")}</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.failedCount}</div>
            </div>

            <div className="bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-[#111827]/60">{t("failedLogins")}</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.failedLogins}</div>
              <div className="text-xs text-[#111827]/50 mt-1">
                {stats.failedLoginRate}% {t("loginAttempts").toLowerCase()}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#111827]/40" />
              <input
                type="text"
                placeholder={t("search")}
                value={filter.search}
                onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#F3F4F6] bg-white text-[#111827] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              />
            </div>

            {/* Filter by Action */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#111827]/40" />
              <select
                value={filter.action}
                onChange={(e) => setFilter((prev) => ({ ...prev, action: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#F3F4F6] bg-white text-[#111827] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none appearance-none"
              >
                <option value="">{t("all")}</option>
                {Object.keys(actionLabels).map((action) => (
                  <option key={action} value={action}>
                    {actionLabels[action]}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Success */}
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#111827]/40" />
              <select
                value={filter.success}
                onChange={(e) => setFilter((prev) => ({ ...prev, success: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#F3F4F6] bg-white text-[#111827] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none appearance-none"
              >
                <option value="">{t("all")}</option>
                <option value="true">{t("successOnly")}</option>
                <option value="false">{t("failedOnly")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F3F4F6]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">
                    {t("date")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">
                    {t("action")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">
                    {t("user")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">
                    {t("ip")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">
                    {t("status")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">
                    {t("details")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#111827]/60">
                      {t("noLogs")}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F3F4F6]/50 transition">
                      <td className="px-4 py-3 text-sm text-[#111827]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#111827]/40" />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#3B82F6]/10 text-[#3B82F6]">
                          {actionLabels[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="text-[#111827] font-medium">
                          {log.user?.firstname} {log.user?.lastname}
                        </div>
                        <div className="text-[#111827]/60 text-xs">{log.email || log.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-[#111827]/70">{log.ip}</td>
                      <td className="px-4 py-3">
                        {log.success ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            <CheckCircle className="w-3 h-3" />
                            {t("success")}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                            <XCircle className="w-3 h-3" />
                            {t("failed")}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#111827]/60">
                        {log.errorMessage || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="border-t border-[#F3F4F6] px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-[#111827]/60">
                {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} sur{" "}
                {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.offset === 0}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-[#F3F4F6] text-[#111827] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F3F4F6] transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t("previous")}
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-[#F3F4F6] text-[#111827] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F3F4F6] transition"
                >
                  {t("next")}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

