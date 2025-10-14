import { User } from "./user.model.ts";
import { Model, DataTypes } from "sequelize";
import database from "../config/database.ts";

type AchievementCategory = "words" | "quizzes" | "streak" | "mastery";

export interface UserAchievementAttributes {
  id?: string;
  userId: string;
  achievementId: string; // ID du badge (first-word, 10-words, etc.)
  category: AchievementCategory;
  unlockedAt?: Date;
  progress?: number; // 0-100 pour les badges en cours
}

export class UserAchievement extends Model<UserAchievementAttributes> implements UserAchievementAttributes {
  declare id: string;
  declare userId: string;
  declare achievementId: string;
  declare category: AchievementCategory;
  declare unlockedAt: Date;
  declare progress?: number;
}

UserAchievement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    achievementId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM("words", "quizzes", "streak", "mastery"),
      allowNull: false,
    },
    unlockedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
  },
  {
    sequelize: database,
    tableName: "user_achievements",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'achievementId'],
      },
      {
        fields: ['userId', 'category'],
      },
    ],
  }
);

export default UserAchievement;



