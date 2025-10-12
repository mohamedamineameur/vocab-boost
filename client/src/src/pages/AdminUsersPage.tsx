import { useState, useEffect } from "react";
import { getUsers } from "../../services/user.services";
import { Users, Search, Shield, CheckCircle, XCircle, Loader2, Mail, Calendar } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }

    loadUsers();
  }, [isAdmin, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.firstname.toLowerCase().includes(searchLower) ||
      user.lastname.toLowerCase().includes(searchLower)
    );
  });

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F3F4F6]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#3B82F6] mb-4" />
            <p className="text-[#111827]/60">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F3F4F6]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-[#3B82F6]" />
            <h1 className="text-3xl font-bold text-[#111827]">User Management</h1>
          </div>
          <p className="text-[#111827]/60">Total: {users.length} users</p>
        </header>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#111827]/40" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#F3F4F6] bg-white text-[#111827] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F3F4F6]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#111827]">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-[#111827]/60">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#F3F4F6]/50 transition">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#111827]">
                          {user.firstname} {user.lastname}
                        </div>
                        <div className="text-xs text-[#111827]/60 font-mono">{user.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[#111827]/40" />
                          <span className="text-sm text-[#111827]">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {user.isVerified ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                            <XCircle className="w-3 h-3" />
                            Unverified
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {user.isAdmin ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold">
                            <Shield className="w-3 h-3" />
                            Admin
                          </div>
                        ) : (
                          <span className="text-sm text-[#111827]/60">User</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-[#111827]/60">
                          <Calendar className="w-4 h-4" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

