import { User } from "./user.model.ts";
import database from "../config/database.ts";
import { DataTypes, Model } from "sequelize";

export interface SessionAttributes {
  id?: string;
  userId: string;
  token: string;
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt: Date;
  ip: string;
  userAgent: string;
}

export class Session extends Model<SessionAttributes> implements SessionAttributes {
  declare id: string;
  declare userId: string;
  declare token: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare expiresAt: Date;
    declare ip: string;
    declare userAgent: string;
}

Session.init(
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
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    tableName: "sessions",
    timestamps: true,
    updatedAt: "updatedAt",
    createdAt: "createdAt",
  }
);

Session.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Session, { foreignKey: 'userId' });

export default Session;