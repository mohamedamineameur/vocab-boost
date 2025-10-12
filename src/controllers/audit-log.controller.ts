import { AuditLog } from "../models/audit-log.model.ts";
import { User } from "../models/user.model.ts";
import type { Request, Response } from "express";
import { Op, fn, col, literal } from "sequelize";


const OpGte = Op.gte as unknown as string;
const OpLte = Op.lte as unknown as string;


/**
 * Récupérer les logs d'audit (admin uniquement)
 */
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      action,
      success,
      limit = 100,
      offset = 0,
      startDate,
      endDate,
    } = req.query;

    // Construire les filtres
    const where: Record<string, unknown> = {};
    
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (success !== undefined) where.success = success === "true";
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, unknown>)[OpGte] = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, unknown>)[OpLte] = end;
      }
    }

    const logs = await AuditLog.findAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "firstname", "lastname"],
          required: false,
        },
      ],
    });

    const total = await AuditLog.count({ where });

    res.status(200).json({
      logs,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < total,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({
      error: {
        en: "Internal server error",
        fr: "Erreur interne du serveur",
        es: "Error interno del servidor",
        ar: "خطأ في الخادم الداخلي",
      },
    });
  }
};

/**
 * Récupérer les logs d'audit d'un utilisateur spécifique
 */
export const getUserAuditLogs = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const logs = await AuditLog.findAll({
      where: { userId },
      limit: Number(limit),
      offset: Number(offset),
      order: [["createdAt", "DESC"]],
    });

    const total = await AuditLog.count({ where: { userId } });

    res.status(200).json({
      logs,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < total,
      },
    });
  } catch (error) {
    console.error("Error fetching user audit logs:", error);
    res.status(500).json({
      error: {
        en: "Internal server error",
        fr: "Erreur interne du serveur",
        es: "Error interno del servidor",
        ar: "خطأ في الخادم الداخلي",
      },
    });
  }
};

/**
 * Obtenir des statistiques sur les logs d'audit
 */
export const getAuditStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: Record<string, unknown> = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, unknown>)[OpGte] = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, unknown>)[OpLte] = end;
      }
    }

    const [totalLogs, successCount, failedCount, loginAttempts, failedLogins] = await Promise.all([
      AuditLog.count({ where }),
      AuditLog.count({ where: { ...where, success: true } }),
      AuditLog.count({ where: { ...where, success: false } }),
      AuditLog.count({
        where: {
          ...where,
          action: {
            [Op.in]: ["LOGIN_SUCCESS", "LOGIN_FAILED"],
          },
        },
      }),
      AuditLog.count({
        where: {
          ...where,
          action: "LOGIN_FAILED",
        },
      }),
    ]);

    // Top actions
    const topActions = await AuditLog.findAll({
      where,
      attributes: [
        "action",
        [fn("COUNT", col("id")), "count"],
      ],
      group: ["action"],
      order: [[literal("count"), "DESC"]],
      limit: 10,
      raw: true,
    });

    res.status(200).json({
      stats: {
        totalLogs,
        successCount,
        failedCount,
        successRate: totalLogs > 0 ? Math.round((successCount / totalLogs) * 100) : 0,
        loginAttempts,
        failedLogins,
        failedLoginRate: loginAttempts > 0 ? Math.round((failedLogins / loginAttempts) * 100) : 0,
      },
      topActions,
    });
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    res.status(500).json({
      error: {
        en: "Internal server error",
        fr: "Erreur interne du serveur",
        es: "Error interno del servidor",
        ar: "خطأ في الخادم الداخلي",
      },
    });
  }
};

