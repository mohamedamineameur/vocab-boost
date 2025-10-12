import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getAuditStats } from "../../services/audit-log.services";
import {
  Shield,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

interface AuditStats {
  totalLogs: number;
  successCount: number;
  failedCount: number;
  successRate: number;
  loginAttempts: number;
  failedLogins: number;
  failedLoginRate: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect non-admins
    if (!isAdmin) {
      navigate("/");
      return;
    }

    loadStats();
  }, [isAdmin, navigate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getAuditStats();
      setStats(data.stats);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F3F4F6]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-[#3B82F6]" />
                <h1 className="text-3xl font-bold text-[#111827]">Admin Dashboard</h1>
              </div>
              <p className="text-[#111827]/60">
                Welcome back, {user?.firstname} {user?.lastname} 👋
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#F3F4F6] text-[#111827] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/audit-logs")}
            className="group bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm hover:shadow-md hover:border-[#3B82F6]/30 transition text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <TrendingUp className="w-5 h-5 text-[#111827]/40 group-hover:text-[#3B82F6] transition" />
            </div>
            <h3 className="text-lg font-semibold text-[#111827] mb-1">Audit Logs</h3>
            <p className="text-sm text-[#111827]/60">View security logs</p>
          </button>

          <button
            onClick={() => navigate("/admin/users")}
            className="group bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm hover:shadow-md hover:border-[#22C55E]/30 transition text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#22C55E]" />
              </div>
              <TrendingUp className="w-5 h-5 text-[#111827]/40 group-hover:text-[#22C55E] transition" />
            </div>
            <h3 className="text-lg font-semibold text-[#111827] mb-1">Users</h3>
            <p className="text-sm text-[#111827]/60">Manage users</p>
          </button>

          <button
            onClick={() => navigate("/sessions")}
            className="group bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm hover:shadow-md hover:border-orange-500/30 transition text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-[#111827]/40 group-hover:text-orange-600 transition" />
            </div>
            <h3 className="text-lg font-semibold text-[#111827] mb-1">Sessions</h3>
            <p className="text-sm text-[#111827]/60">Manage sessions</p>
          </button>

          <button
            onClick={() => navigate("/settings")}
            className="group bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm hover:shadow-md hover:border-purple-500/30 transition text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-[#111827]/40 group-hover:text-purple-600 transition" />
            </div>
            <h3 className="text-lg font-semibold text-[#111827] mb-1">Settings</h3>
            <p className="text-sm text-[#111827]/60">Account settings</p>
          </button>
        </div>

        {/* Security Stats */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#F3F4F6] p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-[#F3F4F6] border-t-[#3B82F6] animate-spin mb-4" />
            <p className="text-[#111827]/60">Loading statistics...</p>
          </div>
        ) : stats ? (
          <>
            <h2 className="text-xl font-bold text-[#111827] mb-4">Security Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-5 h-5 text-[#3B82F6]" />
                  <span className="text-sm text-[#111827]/60">Total Events</span>
                </div>
                <div className="text-3xl font-bold text-[#111827]">{stats.totalLogs.toLocaleString()}</div>
              </div>

              <div className="bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                  <span className="text-sm text-[#111827]/60">Success Rate</span>
                </div>
                <div className="text-3xl font-bold text-[#22C55E]">{stats.successRate}%</div>
                <div className="text-xs text-[#111827]/50 mt-1">
                  {stats.successCount.toLocaleString()} successful
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-[#111827]/60">Failed Actions</span>
                </div>
                <div className="text-3xl font-bold text-red-600">{stats.failedCount.toLocaleString()}</div>
              </div>

              <div className="bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-[#111827]/60">Failed Logins</span>
                </div>
                <div className="text-3xl font-bold text-orange-600">{stats.failedLogins.toLocaleString()}</div>
                <div className="text-xs text-[#111827]/50 mt-1">
                  {stats.failedLoginRate}% of {stats.loginAttempts} attempts
                </div>
              </div>
            </div>

            {/* Security Alert */}
            {stats.failedLoginRate > 10 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">
                      High Failed Login Rate Detected
                    </h3>
                    <p className="text-sm text-red-700">
                      {stats.failedLoginRate}% of login attempts are failing. This may indicate:
                    </p>
                    <ul className="text-sm text-red-700 mt-2 space-y-1 ml-4">
                      <li>• Brute force attack attempts</li>
                      <li>• Users forgetting passwords</li>
                      <li>• Account enumeration attempts</li>
                    </ul>
                    <button
                      onClick={() => navigate("/admin/audit-logs?action=LOGIN_FAILED")}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-medium"
                    >
                      Investigate Failed Logins
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* Recent Admin Actions */}
        <div className="bg-white rounded-2xl border border-[#F3F4F6] p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#111827] mb-4">Quick Links</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/audit-logs")}
              className="w-full text-left px-4 py-3 rounded-xl border border-[#F3F4F6] hover:bg-[#F3F4F6] transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#3B82F6]" />
                <div>
                  <div className="font-medium text-[#111827]">Security Audit Logs</div>
                  <div className="text-xs text-[#111827]/60">
                    View all authentication and security events
                  </div>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-[#111827]/40" />
            </button>

            <button
              onClick={() => navigate("/admin/users")}
              className="w-full text-left px-4 py-3 rounded-xl border border-[#F3F4F6] hover:bg-[#F3F4F6] transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#22C55E]" />
                <div>
                  <div className="font-medium text-[#111827]">User Management</div>
                  <div className="text-xs text-[#111827]/60">View and manage all users</div>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-[#111827]/40" />
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full text-left px-4 py-3 rounded-xl border border-[#F3F4F6] hover:bg-[#F3F4F6] transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-[#111827]">User Dashboard</div>
                  <div className="text-xs text-[#111827]/60">View your learning progress</div>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-[#111827]/40" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

