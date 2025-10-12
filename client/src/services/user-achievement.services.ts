import api from "./main";

export interface UserAchievement {
  id?: string;
  userId: string;
  achievementId: string;
  category: "words" | "quizzes" | "streak" | "mastery";
  unlockedAt?: Date;
  progress?: number;
}

export const unlockAchievement = async (achievementId: string, category: UserAchievement["category"]) => {
  const response = await api.post("/user-achievements/unlock", {
    achievementId,
    category,
  });
  return response.data;
};

export const getUserAchievements = async () => {
  const response = await api.get("/user-achievements");
  return response.data;
};

export const updateAchievementProgress = async (
  achievementId: string,
  category: UserAchievement["category"],
  progress: number
) => {
  const response = await api.put("/user-achievements/progress", {
    achievementId,
    category,
    progress,
  });
  return response.data;
};


