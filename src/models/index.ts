import { Category } from "./category.model.ts";
import { Session } from "./session.model.ts";
import { User } from "./user.model.ts";
import { Profile } from "./profile.model.ts";
import { Word } from "./word.model.ts";
import database  from "../config/database.ts";

function initModels() {
  // Associations
  Session.belongsTo(User, { foreignKey: 'userId' });
  User.hasMany(Session, { foreignKey: 'userId' });
  Profile.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasOne(Profile, { foreignKey: 'userId', as: 'profile' });
  Category.hasMany(Word, { foreignKey: 'categoryId', as: 'words' });
  Word.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

  console.log("✅ Models initialized:", {
    User: !!User,
    Profile: !!Profile,
    Session: !!Session,
    Category: !!Category,
    Word: !!Word,
  });
}

export {
  User,
  Profile,
  Session,
  Category,
  Word,
  database,
  initModels
};
