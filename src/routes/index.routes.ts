import { Router } from "express";
import userRouter from "./user.routes.ts";
import sessionRouter from "./session.routes.ts";
import profileRouter from "./profile.routes.ts";
import categoryRouter from "./category.routes.ts";
import wordRouter from "./word.routes.ts";
import userWordRouter from "./user-word.routes.ts";
import quizRouter from "./quiz.routes.ts";


const router = Router();

router.use("/users", userRouter);
router.use("/sessions", sessionRouter);
router.use("/profiles", profileRouter);
router.use("/categories", categoryRouter);
router.use("/words", wordRouter);
router.use("/user-words", userWordRouter);
router.use("/quizzes", quizRouter);

export default router;
