import { UserAchievement } from "../models/user-achievement.model.ts";
import { Request, Response } from "express";
import { getScopeWhere } from "../middlewares/getScope.ts";

export const unlockAchievement = async (req: Request, res: Response) => {
  try {
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

    const { achievementId, category } = req.body;

    // Vérifier si le badge est déjà débloqué
    const existing = await UserAchievement.findOne({
      where: {
        userId: scope.user.id,
        achievementId,
      },
    });

    if (existing) {
      return res.status(400).json({ error: { en: "Achievement already unlocked", fr: "Badge déjà débloqué", es: "Logro ya desbloqueado", ar: "الإنجاز مفتوح بالفعل" } });
    }

    const achievement = await UserAchievement.create({
      userId: scope.user.id,
      achievementId,
      category,
      progress: 100,
    });

    res.status(201).json(achievement);
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const getUserAchievements = async (req: Request, res: Response) => {
  try {
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

    const achievements = await UserAchievement.findAll({
      where: scope.where,
      order: [['unlockedAt', 'DESC']],
    });

    res.status(200).json(achievements);
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const updateAchievementProgress = async (req: Request, res: Response) => {
  try {
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

    const { achievementId, progress } = req.body;

    const [achievement, created] = await UserAchievement.findOrCreate({
      where: {
        userId: scope.user.id,
        achievementId,
      },
      defaults: {
        userId: scope.user.id,
        achievementId,
        category: req.body.category,
        progress,
      },
    });

    if (!created) {
      achievement.progress = progress;
      await achievement.save();
    }

    res.status(200).json(achievement);
  } catch (error) {
    console.error("Error updating achievement progress:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

