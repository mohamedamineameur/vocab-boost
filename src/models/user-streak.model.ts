import { User } from "./user.model.ts";
import { Model, DataTypes } from "sequelize";
import database from "../config/database.ts";

export interface UserStreakAttributes {
  id?: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  updatedAt?: Date;
}

export class UserStreak extends Model<UserStreakAttributes> implements UserStreakAttributes {
  declare id: string;
  declare userId: string;
  declare currentStreak: number;
  declare longestStreak: number;
  declare lastActivityDate?: Date;
  declare updatedAt: Date;
}

UserStreak.init(
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
      unique: true,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastActivityDate: {
      type: DataTypes.DATEONLY, // Juste la date, pas l'heure
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: database,
    tableName: "user_streaks",
    timestamps: true,
    createdAt: false,
    updatedAt: 'updatedAt',
  }
);

export default UserStreak;



