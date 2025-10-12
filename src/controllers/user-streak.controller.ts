import { UserStreak } from "../models/user-streak.model.ts";
import { Request, Response } from "express";
import { getScopeWhere } from "../middlewares/getScope.ts";

export const getUserStreak = async (req: Request, res: Response) => {
  try {
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }
    
    let streak = await UserStreak.findOne({
      where: { userId: scope.user.id },
    });
    
    if (!streak) {
      // Créer un nouveau streak pour l'utilisateur
      streak = await UserStreak.create({
        userId: scope.user.id,
        currentStreak: 0,
        longestStreak: 0,
      });
    }
    
    res.status(200).json(streak);
  } catch (error) {
    console.error("Error fetching user streak:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const updateUserStreak = async (req: Request, res: Response) => {
  try {
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

    const { lastActivityDate } = req.body;
    
    // Validation de la date
    if (!lastActivityDate) {
      return res.status(400).json({ error: { en: "Date is required", fr: "Date requise", es: "Fecha requerida", ar: "التاريخ مطلوب" } });
    }

    // Vérifier le format de la date (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(lastActivityDate)) {
      return res.status(400).json({ error: { en: "Invalid date format", fr: "Format de date invalide", es: "Formato de fecha inválido", ar: "تنسيق التاريخ غير صالح" } });
    }

    // Vérifier que la date n'est pas dans le futur
    const today = new Date().toISOString().split('T')[0];
    if (lastActivityDate > today) {
      return res.status(400).json({ error: { en: "Future dates not allowed", fr: "Les dates futures ne sont pas autorisées", es: "No se permiten fechas futuras", ar: "التواريخ المستقبلية غير مسموحة" } });
    }

    const activityDate = lastActivityDate; // Utiliser la date fournie

    let [streak, created] = await UserStreak.findOrCreate({
      where: { userId: scope.user.id },
      defaults: {
        userId: scope.user.id,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: activityDate as any,
      },
    });

    if (!created) {
      const lastActivity = streak.lastActivityDate?.toString() || '';
      
      // Si déjà actif le même jour, ne rien faire
      if (lastActivity === activityDate) {
        return res.status(200).json(streak);
      }

      const yesterday = new Date(activityDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActivity === yesterdayStr) {
        // Continuer la série
        streak.currentStreak += 1;
        streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
      } else if (lastActivity < yesterdayStr) {
        // Série brisée, recommencer
        streak.currentStreak = 1;
      }

      streak.lastActivityDate = activityDate as any;
      await streak.save();
    }

    res.status(200).json(streak);
  } catch (error) {
    console.error("Error updating user streak:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};


