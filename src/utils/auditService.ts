import { AuditLog, type AuditAction, type ResourceType } from "../models/audit-log.model.ts";
import type { Request } from "express";

interface AuditLogOptions {
  req: Request;
  userId?: string;
  email?: string;
  action: AuditAction;
  resourceType?: ResourceType;
  resourceId?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Service centralisé pour créer des logs d'audit
 * Principe de non-répudiation : enregistre QUI a fait QUOI, QUAND, OÙ et RÉSULTAT
 */
export const createAuditLog = async (options: AuditLogOptions): Promise<void> => {
  try {
    const {
      req,
      userId,
      email,
      action,
      resourceType,
      resourceId,
      success,
      errorMessage,
      metadata,
    } = options;

    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const userAgent = req.get("User-Agent") || "unknown";

    await AuditLog.create({
      userId,
      email,
      action,
      resourceType,
      resourceId,
      ip,
      userAgent,
      success,
      errorMessage,
      metadata,
    });

    // Log aussi dans console pour monitoring en temps réel
    const logLevel = success ? "info" : "warn";
    const emoji = success ? "✅" : "❌";
    console[logLevel](
      `${emoji} AUDIT [${action}] User: ${email || userId || "anonymous"} | IP: ${ip} | Success: ${success}${
        errorMessage ? ` | Error: ${errorMessage}` : ""
      }`
    );
  } catch (error) {
    // Ne jamais faire échouer une requête à cause d'un échec de log
    console.error("❌ Failed to create audit log:", error);
  }
};

/**
 * Helper pour loguer les tentatives de connexion
 */
export const logLoginAttempt = async (
  req: Request,
  email: string,
  success: boolean,
  errorMessage?: string
) => {
  await createAuditLog({
    req,
    email,
    action: success ? "LOGIN_SUCCESS" : "LOGIN_FAILED",
    resourceType: "SESSION",
    success,
    errorMessage,
    metadata: {
      email,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Helper pour loguer la vérification MFA
 */
export const logMFAVerification = async (
  req: Request,
  userId: string,
  email: string,
  success: boolean,
  errorMessage?: string
) => {
  await createAuditLog({
    req,
    userId,
    email,
    action: success ? "MFA_VERIFIED" : "MFA_FAILED",
    resourceType: "SESSION",
    success,
    errorMessage,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Helper pour loguer les changements de mot de passe
 */
export const logPasswordChange = async (
  req: Request,
  userId: string,
  email: string,
  action: "PASSWORD_CHANGED" | "PASSWORD_RESET_REQUESTED" | "PASSWORD_RESET_COMPLETED",
  success: boolean,
  errorMessage?: string
) => {
  await createAuditLog({
    req,
    userId,
    email,
    action,
    resourceType: "PASSWORD",
    resourceId: userId,
    success,
    errorMessage,
  });
};

/**
 * Helper pour loguer les modifications de profil
 */
export const logProfileUpdate = async (
  req: Request,
  userId: string,
  email: string,
  changes: Record<string, unknown>,
  success: boolean
) => {
  await createAuditLog({
    req,
    userId,
    email,
    action: changes.email ? "EMAIL_CHANGED" : "PROFILE_UPDATED",
    resourceType: "PROFILE",
    resourceId: userId,
    success,
    metadata: changes,
  });
};

/**
 * Helper pour loguer la création/suppression d'utilisateur
 */
export const logUserManagement = async (
  req: Request,
  action: "USER_CREATED" | "USER_DELETED" | "ADMIN_USER_CREATED" | "ADMIN_USER_DELETED",
  targetUserId: string,
  targetEmail: string,
  actorUserId?: string,
  success: boolean = true
) => {
  await createAuditLog({
    req,
    userId: actorUserId || targetUserId,
    email: targetEmail,
    action,
    resourceType: "USER",
    resourceId: targetUserId,
    success,
    metadata: {
      targetUserId,
      targetEmail,
      actorUserId,
    },
  });
};

/**
 * Helper pour loguer les actions de session
 */
export const logSessionAction = async (
  req: Request,
  userId: string,
  action: "LOGOUT" | "SESSION_REVOKED",
  sessionId: string,
  success: boolean
) => {
  await createAuditLog({
    req,
    userId,
    action,
    resourceType: "SESSION",
    resourceId: sessionId,
    success,
  });
};


