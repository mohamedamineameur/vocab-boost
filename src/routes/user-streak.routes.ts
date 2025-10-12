import { Router } from "express";
import {
  getUserStreak,
  updateUserStreak,
} from "../controllers/user-streak.controller.ts";
import { isAuthenticated } from "../middlewares/isAuthenticated.ts";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(isAuthenticated());

// GET /api/user-streak - Récupérer le streak de l'utilisateur
router.get("/", getUserStreak);

// POST /api/user-streak - Mettre à jour le streak (appelé lors d'une activité)
router.post("/", updateUserStreak);

export default router;


