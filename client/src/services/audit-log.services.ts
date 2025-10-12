import api from "./main";

export const getAuditLogs = async (params?: {
  userId?: string;
  action?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get("/audit-logs", { params });
  return response.data;
};

export const getUserAuditLogs = async (userId: string, params?: {
  limit?: number;
  offset?: number;
}) => {
  const response = await api.get(`/audit-logs/user/${userId}`, { params });
  return response.data;
};

export const getAuditStats = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get("/audit-logs/stats", { params });
  return response.data;
};

