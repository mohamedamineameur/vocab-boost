import api from "./main";

export interface UserStreak {
  id?: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  updatedAt?: Date;
}

export const getUserStreak = async () => {
  const response = await api.get("/user-streak");
  return response.data;
};

export const updateUserStreak = async (lastActivityDate?: string) => {
  const today = lastActivityDate || new Date().toISOString().split('T')[0];
  const response = await api.post("/user-streak", { lastActivityDate: today });
  return response.data;
};


