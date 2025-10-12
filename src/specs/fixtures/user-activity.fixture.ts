import { UserActivity } from "../../models/user-activity.model";
import { createUserFixture } from "./user.fixture";
import { createWordFixture } from "./word.fixture";
import { faker } from "@faker-js/faker";

export const createUserActivityFixture = async (overrides: Partial<any> = {}) => {
  const user = overrides.userId ? null : await createUserFixture();
  const word = await createWordFixture();
  
  const userActivityData = {
    userId: overrides.userId ?? user?.id,
    activityType: overrides.activityType ?? "quiz_correct",
    userWordId: overrides.userWordId ?? null,
    quizId: overrides.quizId ?? null,
    metadata: overrides.metadata ?? {
      word: word.text,
      score: 100,
      timestamp: new Date().toISOString(),
    },
    ...overrides,
  };

  const userActivity = await UserActivity.create(userActivityData);
  return userActivity.toJSON();
};

// Helper pour créer une activité de quiz correct
export const createQuizCorrectActivityFixture = async (userId?: string) => {
  return createUserActivityFixture({
    userId,
    activityType: "quiz_correct",
    metadata: {
      word: faker.word.sample(),
      score: 100,
      timestamp: new Date().toISOString(),
    },
  });
};

// Helper pour créer une activité de quiz incorrect
export const createQuizIncorrectActivityFixture = async (userId?: string) => {
  return createUserActivityFixture({
    userId,
    activityType: "quiz_incorrect",
    metadata: {
      word: faker.word.sample(),
      score: 0,
      timestamp: new Date().toISOString(),
    },
  });
};

// Helper pour créer une activité de mot appris
export const createWordLearnedActivityFixture = async (userId?: string) => {
  return createUserActivityFixture({
    userId,
    activityType: "word_learned",
    metadata: {
      word: faker.word.sample(),
      timestamp: new Date().toISOString(),
    },
  });
};

// Helper pour créer une activité de mot ajouté
export const createWordAddedActivityFixture = async (userId?: string) => {
  return createUserActivityFixture({
    userId,
    activityType: "word_added",
    metadata: {
      word: faker.word.sample(),
      timestamp: new Date().toISOString(),
    },
  });
};

// Helper pour créer plusieurs activités
export const createMultipleActivitiesFixture = async (userId?: string, count: number = 3) => {
  const activities = [];
  for (let i = 0; i < count; i++) {
    const activity = await createUserActivityFixture({
      userId,
      metadata: {
        word: `word${i + 1}`,
        score: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString(),
      },
    });
    activities.push(activity);
  }
  return activities;
};

// Helper pour créer des activités avec différents types
export const createActivitiesWithTypesFixture = async (userId?: string) => {
  const activities = [];
  
  activities.push(await createQuizCorrectActivityFixture(userId));
  activities.push(await createQuizIncorrectActivityFixture(userId));
  activities.push(await createWordLearnedActivityFixture(userId));
  activities.push(await createWordAddedActivityFixture(userId));
  
  return activities;
};