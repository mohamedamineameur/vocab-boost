import { UserActivity } from "../models/user-activity.model.ts";
import { Request, Response } from "express";
import { getScopeWhere } from "../middlewares/getScope.ts";

export const createUserActivity = async (req: Request, res: Response) => {
  try {
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

    const { activityType, userWordId, quizId, metadata } = req.body;

    const activity = await UserActivity.create({
      userId: scope.user.id,
      activityType,
      userWordId,
      quizId,
      metadata,
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error("Error creating user activity:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const getUserActivities = async (req: Request, res: Response) => {
  try {
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

    const { limit = 50, offset = 0 } = req.query;

    const activities = await UserActivity.findAll({
      where: scope.where,
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const deleteUserActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

    const activity = await UserActivity.findByPk(id);
    if (!activity) {
      return res.status(404).json({ error: { en: "Activity not found", fr: "Activité non trouvée", es: "Actividad no encontrada", ar: "النشاط غير موجود" } });
    }

    if (activity.userId !== scope.user.id && !scope.user.isAdmin) {
      return res.status(403).json({ error: { en: "Forbidden", fr: "Interdit", es: "Prohibido", ar: "محظور" } });
    }

    await activity.destroy();
    res.status(200).json({ message: { en: "Activity deleted successfully", fr: "Activité supprimée avec succès", es: "Actividad eliminada con éxito", ar: "تم حذف النشاط بنجاح" } });
  } catch (error) {
    console.error("Error deleting user activity:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};


