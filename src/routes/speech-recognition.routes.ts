import { Router } from "express";
import multer from "multer";
import { recognizeSpeech } from "../controllers/speech-recognition.controller.ts";

const router = Router();

// Configuration de multer pour stocker les fichiers en mémoire
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
});

// POST /api/speech-recognition - Reconnaître la parole depuis un fichier audio
router.post("/", upload.single("audio"), recognizeSpeech);

export default router;

