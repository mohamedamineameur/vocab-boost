import { UserStreak } from "../../models/user-streak.model";
import { createUserFixture } from "./user.fixture";

export const createUserStreakFixture = async (overrides: Partial<any> = {}) => {
  const user = overrides.userId ? null : await createUserFixture();
  
  const userStreakData = {
    userId: overrides.userId ?? user?.id,
    currentStreak: overrides.currentStreak ?? 7,
    longestStreak: overrides.longestStreak ?? 15,
    lastActivityDate: overrides.lastActivityDate ?? new Date().toISOString().split('T')[0],
    ...overrides,
  };

  const userStreak = await UserStreak.create(userStreakData);
  return userStreak.toJSON();
};

// Helper pour créer un streak de nouvel utilisateur
export const createNewUserStreakFixture = async (userId?: string) => {
  return createUserStreakFixture({
    userId,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
  });
};

// Helper pour créer un streak long
export const createLongStreakFixture = async (userId?: string) => {
  return createUserStreakFixture({
    userId,
    currentStreak: 30,
    longestStreak: 30,
    lastActivityDate: new Date().toISOString().split('T')[0],
  });
};

// Helper pour créer un streak cassé (2 jours avant)
export const createBrokenStreakFixture = async (userId?: string) => {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return createUserStreakFixture({
    userId,
    currentStreak: 0,
    longestStreak: 25,
    lastActivityDate: twoDaysAgo,
  });
};

// Helper pour créer un streak d'hier
export const createYesterdayStreakFixture = async (userId?: string) => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return createUserStreakFixture({
    userId,
    lastActivityDate: yesterday,
  });
};

// Helper pour créer un streak d'aujourd'hui
export const createTodayStreakFixture = async (userId?: string) => {
  const today = new Date().toISOString().split('T')[0];
  return createUserStreakFixture({
    userId,
    lastActivityDate: today,
  });
};

// Helper pour créer un vieux streak (3 jours avant)
export const createOldStreakFixture = async (userId?: string) => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return createUserStreakFixture({
    userId,
    lastActivityDate: threeDaysAgo,
  });
};