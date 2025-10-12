import { Router } from "express";
import {
  createUserActivity,
  getUserActivities,
  deleteUserActivity,
} from "../controllers/user-activity.controller.ts";
import { isAuthenticated } from "../middlewares/isAuthenticated.ts";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(isAuthenticated());

// GET /api/user-activities - Récupérer les activités de l'utilisateur
router.get("/", getUserActivities);

// POST /api/user-activities - Créer une nouvelle activité
router.post("/", createUserActivity);

// DELETE /api/user-activities/:id - Supprimer une activité
router.delete("/:id", deleteUserActivity);

export default router;


