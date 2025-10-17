import { Router } from "express";
import {
  unlockAchievement,
  getUserAchievements,
  updateAchievementProgress,
} from "../controllers/user-achievement.controller.ts";
import { isAuthenticated } from "../middlewares/isAuthenticated.ts";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(isAuthenticated());

// GET /api/user-achievements - Récupérer les badges de l'utilisateur
router.get("/", getUserAchievements);

// POST /api/user-achievements/unlock - Débloquer un badge
router.post("/unlock", unlockAchievement);

// PUT /api/user-achievements/progress - Mettre à jour la progression d'un badge
router.put("/progress", updateAchievementProgress);

export default router;




