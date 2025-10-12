import database from "../config/database.ts";
import { DataTypes, Model, type Optional } from "sequelize";

export interface UserAttributes {
  id?: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  firstname: string;
  lastname: string;
  verificationToken?: string;
  isVerified?: boolean;
  oneTimePassword?: string;
  otpExpiration?: Date;
  isAdmin?: boolean;
}

// Permet de typer correctement les champs optionnels
export interface UserCreationAttributes extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt"> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare password: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare firstname: string;
  declare lastname: string;
  declare verificationToken?: string;
  declare isVerified: boolean;
  declare oneTimePassword?: string;
  declare otpExpiration?: Date;
  declare isAdmin: boolean;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    verificationToken: DataTypes.STRING,
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    oneTimePassword: DataTypes.STRING,
    otpExpiration: DataTypes.DATE,
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize: database,
    tableName: "users",
    timestamps: true, // Sequelize gère createdAt / updatedAt automatiquement
  }
);
