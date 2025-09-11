import { Category } from "./category.model.ts";
import { Session } from "./session.model.ts";
import { User } from "./user.model.ts";
import { Profile } from "./profile.model.ts";
import { Word } from "./word.model.ts";
import Quiz from "./quiz.model.ts";
import { UserWord } from "./user-word.model.ts";
import database from "../config/database.ts";

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
}

export {
  User,
  Profile,
  Session,
  Category,
  Word,
  Quiz,
  UserWord,
  database,
  initModels,
};
