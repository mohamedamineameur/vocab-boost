import api from "./main";

export interface UserActivity {
  id?: string;
  userId: string;
  activityType: "quiz_completed" | "word_learned" | "word_added" | "quiz_correct" | "quiz_incorrect";
  userWordId?: string;
  quizId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export const createUserActivity = async (activity: Omit<UserActivity, 'id' | 'userId' | 'createdAt'>) => {
  const response = await api.post("/user-activities", activity);
  return response.data;
};

export const getUserActivities = async (limit = 50, offset = 0) => {
  const response = await api.get("/user-activities", {
    params: { limit, offset },
  });
  return response.data;
};

export const deleteUserActivity = async (id: string) => {
  const response = await api.delete(`/user-activities/${id}`);
  return response.data;
};


