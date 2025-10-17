import { User } from "./user.model.ts";
import { UserWord } from "./user-word.model.ts";
import { Quiz } from "./quiz.model.ts";
import { Model, DataTypes } from "sequelize";
import database from "../config/database.ts";

type ActivityType = "quiz_completed" | "word_learned" | "word_added" | "quiz_correct" | "quiz_incorrect";

export interface UserActivityAttributes {
  id?: string;
  userId: string;
  activityType: ActivityType;
  userWordId?: string;
  quizId?: string;
  metadata?: Record<string, any>; // Pour stocker des infos supplémentaires (score, etc.)
  createdAt?: Date;
}

export class UserActivity extends Model<UserActivityAttributes> implements UserActivityAttributes {
  declare id: string;
  declare userId: string;
  declare activityType: ActivityType;
  declare userWordId?: string;
  declare quizId?: string;
  declare metadata?: Record<string, any>;
  declare createdAt: Date;
}

UserActivity.init(
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
    activityType: {
      type: DataTypes.ENUM(
        "quiz_completed",
        "word_learned",
        "word_added",
        "quiz_correct",
        "quiz_incorrect"
      ),
      allowNull: false,
    },
    userWordId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: UserWord,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    quizId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Quiz,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: database,
    tableName: "user_activities",
    timestamps: true,
    updatedAt: false,
    createdAt: 'createdAt',
    indexes: [
      {
        fields: ['userId', 'createdAt'],
      },
      {
        fields: ['userId', 'activityType'],
      },
    ],
  }
);

export default UserActivity;




