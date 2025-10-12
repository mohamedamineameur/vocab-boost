import { Router } from "express";
import userRouter from "./user.routes.ts";
import sessionRouter from "./session.routes.ts";
import profileRouter from "./profile.routes.ts";
import categoryRouter from "./category.routes.ts";
import wordRouter from "./word.routes.ts";
import userWordRouter from "./user-word.routes.ts";
import quizRouter from "./quiz.routes.ts";
import userCategoryRouter from "./user-category.routes.ts";
import audioRouter from "./audio.route.ts";
import speechRecognitionRouter from "./speech-recognition.routes.ts";
import userActivityRouter from "./user-activity.routes.ts";
import userAchievementRouter from "./user-achievement.routes.ts";
import userStreakRouter from "./user-streak.routes.ts";
import auditLogRouter from "./audit-log.routes.ts";


const router = Router();

// Health check pour Render
router.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV 
  });
});

router.use("/users", userRouter);
router.use("/sessions", sessionRouter);
router.use("/profiles", profileRouter);
router.use("/categories", categoryRouter);
router.use("/words", wordRouter);
router.use("/user-words", userWordRouter);
router.use("/quizzes", quizRouter);
router.use("/user-categories", userCategoryRouter);
router.use("/audio", audioRouter);
router.use("/speech-recognition", speechRecognitionRouter);
router.use("/user-activities", userActivityRouter);
router.use("/user-achievements", userAchievementRouter);
router.use("/user-streak", userStreakRouter);
router.use("/audit-logs", auditLogRouter);

export default router;
