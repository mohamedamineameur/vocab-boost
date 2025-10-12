import { Category } from "./category.model.ts";
import { Session } from "./session.model.ts";
import { User } from "./user.model.ts";
import { Profile } from "./profile.model.ts";
import { Word } from "./word.model.ts";
import Quiz from "./quiz.model.ts";
import { UserWord } from "./user-word.model.ts";
import database from "../config/database.ts";
import { UserCategory } from "./user-category.model.ts";
import { UserActivity } from "./user-activity.model.ts";
import { UserAchievement } from "./user-achievement.model.ts";
import { UserStreak } from "./user-streak.model.ts";
import { AuditLog } from "./audit-log.model.ts";

function initModels() {
  // ========================
  // User ↔ Session
  // ========================
  Session.belongsTo(User, { foreignKey: "userId", as: "sessionUser" });
  User.hasMany(Session, { foreignKey: "userId", as: "sessions" });

  // ========================
  // User ↔ Profile
  // ========================
  Profile.belongsTo(User, { foreignKey: "userId", as: "user" });
  User.hasOne(Profile, { foreignKey: "userId", as: "profile" });

  // ========================
  // Category ↔ Word
  // ========================
  Category.hasMany(Word, { foreignKey: "categoryId", as: "words" });
  Word.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

  // ========================
  // UserWord ↔ Quiz
  // ========================
  Quiz.belongsTo(UserWord, { foreignKey: "userWordId", as: "userWord" });
  UserWord.hasMany(Quiz, { foreignKey: "userWordId", as: "quizzes" });

  // ========================
  // UserWord ↔ User
  // ========================
  UserWord.belongsTo(User, { foreignKey: "userId", as: "owner" });
  User.hasMany(UserWord, { foreignKey: "userId", as: "userWords" });

  // ========================
  // UserWord ↔ Word
  // ========================
  UserWord.belongsTo(Word, { foreignKey: "wordId", as: "word" });
  Word.hasMany(UserWord, { foreignKey: "wordId", as: "userWords" });
  // ========================
  // UserCaregory ↔ User
  // ========================
  UserCategory.belongsTo(User, { foreignKey: "userId", as: "owner" })
  User.hasMany(UserCategory,{ foreignKey: "userId", as: "userCategories" })
// ========================
  // UserCategory ↔ Category
  // ========================
  UserCategory.belongsTo(Category,{ foreignKey: "categoryId", as: "category" })
  Category.hasMany(UserCategory,{ foreignKey: "categoryId", as: "userCategories" })

  // ========================
  // UserActivity ↔ User
  // ========================
  UserActivity.belongsTo(User, { foreignKey: "userId", as: "user" });
  User.hasMany(UserActivity, { foreignKey: "userId", as: "activities" });

  // ========================
  // UserActivity ↔ UserWord
  // ========================
  UserActivity.belongsTo(UserWord, { foreignKey: "userWordId", as: "userWord" });
  UserWord.hasMany(UserActivity, { foreignKey: "userWordId", as: "activities" });

  // ========================
  // UserActivity ↔ Quiz
  // ========================
  UserActivity.belongsTo(Quiz, { foreignKey: "quizId", as: "quiz" });
  Quiz.hasMany(UserActivity, { foreignKey: "quizId", as: "activities" });

  // ========================
  // UserAchievement ↔ User
  // ========================
  UserAchievement.belongsTo(User, { foreignKey: "userId", as: "user" });
  User.hasMany(UserAchievement, { foreignKey: "userId", as: "achievements" });

  // ========================
  // UserStreak ↔ User
  // ========================
  UserStreak.belongsTo(User, { foreignKey: "userId", as: "user" });
  User.hasOne(UserStreak, { foreignKey: "userId", as: "streak" });

  // ========================
  // AuditLog ↔ User
  // ========================
  AuditLog.belongsTo(User, { foreignKey: "userId", as: "user" });
  User.hasMany(AuditLog, { foreignKey: "userId", as: "auditLogs" });

}

export {
  User,
  Profile,
  Session,
  Category,
  Word,
  Quiz,
  UserWord,
  UserActivity,
  UserAchievement,
  UserStreak,
  AuditLog,
  database,
  initModels,
};
