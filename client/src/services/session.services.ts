import api from "./main";

export const verifyMFACode = async (userId: string, code: string) => {
  const response = await api.post("/sessions/verify-mfa", { userId, code });
  return response.data;
};

export const getUserSessions = async () => {
  const response = await api.get("/sessions");
  return response.data;
};

export const revokeSession = async (sessionId: string) => {
  const response = await api.delete(`/sessions/${sessionId}`);
  return response.data;
};

