import database from "../config/database.ts";
import { DataTypes, Model, type Optional } from "sequelize";
import { User } from "./user.model.ts";

export interface ProfileAttributes {
  id?: string;
  userId: string | undefined;
  local?: 'en' | 'fr' | 'es' | 'ar';
    theme?: 'light' | 'dark';
    createdAt?: Date;
    updatedAt?: Date;
    }

export interface ProfileCreationAttributes extends Optional<ProfileAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Profile extends Model<ProfileAttributes, ProfileCreationAttributes> implements ProfileAttributes {
  declare id: string;
  declare userId: string;
  declare local: 'en' | 'fr' | 'es' | 'ar';
  declare theme: 'light' | 'dark';
  declare createdAt: Date;
  declare updatedAt: Date;
}

Profile.init(
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
      unique: true,
      onDelete: 'CASCADE',
    },
    local: {
      type: DataTypes.ENUM('en', 'fr', 'es', 'ar'),
      allowNull: false,
      defaultValue: 'en',
    },
    theme: {
      type: DataTypes.ENUM('light', 'dark'),
      allowNull: false,
      defaultValue: 'light',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: database,
    tableName: "profiles",
  }
);
