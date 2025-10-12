import database from "../config/database.ts";
import { DataTypes, Model, Optional } from "sequelize";

export type AuditAction =
  // Authentication
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "MFA_SENT"
  | "MFA_VERIFIED"
  | "MFA_FAILED"
  | "LOGOUT"
  | "SESSION_REVOKED"
  // User Management
  | "USER_CREATED"
  | "USER_DELETED"
  | "EMAIL_VERIFIED"
  | "EMAIL_VERIFICATION_RESENT"
  // Security
  | "PASSWORD_CHANGED"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_RESET_COMPLETED"
  | "PASSWORD_RESET_FAILED"
  | "EMAIL_CHANGED"
  | "PROFILE_UPDATED"
  // Admin Actions
  | "ADMIN_USER_CREATED"
  | "ADMIN_USER_DELETED"
  | "ADMIN_USER_UPDATED";

export type ResourceType = "USER" | "SESSION" | "PASSWORD" | "EMAIL" | "PROFILE";

export interface AuditLogAttributes {
  id?: string;
  userId?: string;
  email?: string;
  action: AuditAction;
  resourceType?: ResourceType;
  resourceId?: string;
  ip: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export interface AuditLogCreationAttributes
  extends Optional<AuditLogAttributes, "id" | "createdAt"> {}

export class AuditLog
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes
{
  declare id: string;
  declare userId?: string;
  declare email?: string;
  declare action: AuditAction;
  declare resourceType?: ResourceType;
  declare resourceId?: string;
  declare ip: string;
  declare userAgent: string;
  declare success: boolean;
  declare errorMessage?: string;
  declare metadata?: Record<string, unknown>;
  declare createdAt: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL", // Garder le log même si user supprimé
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resourceType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resourceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: database,
    tableName: "audit_logs",
    timestamps: false, // On gère createdAt manuellement
    indexes: [
      { fields: ["userId"] },
      { fields: ["email"] },
      { fields: ["action"] },
      { fields: ["createdAt"] },
      { fields: ["success"] },
    ],
  }
);

export default AuditLog;

