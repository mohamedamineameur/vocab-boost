import { UserAchievement } from "../../models/user-achievement.model";
import { createUserFixture } from "./user.fixture";

export const createUserAchievementFixture = async (overrides: Partial<{userId: string; achievementId: string; category: "words" | "quizzes" | "streak" | "mastery"; progress: number; unlockedAt: Date | null;}> = {}) => {
  const user = overrides.userId ? { id: overrides.userId } : await createUserFixture();

  if (!user.id) {
    throw new Error("user.id must be defined");
  }

  const userAchievementData = {
    userId: user.id as string,
    achievementId: overrides.achievementId ?? "test-achievement",
    category: overrides.category ?? "words" as const,
    progress: overrides.progress ?? 100,
    unlockedAt: overrides.unlockedAt ?? new Date(),
  };

  const userAchievement = await UserAchievement.create(userAchievementData);
  return userAchievement.toJSON();
};