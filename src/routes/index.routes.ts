import { Router } from "express";
import userRouter from "./user.routes.ts";
import sessionRouter from "./session.routes.ts";
import profileRouter from "./profile.routes.ts";
import categoryRouter from "./category.routes.ts";
import wordRouter from "./word.routes.ts";


const router = Router();

router.use("/users", userRouter);
router.use("/sessions", sessionRouter);
router.use("/profiles", profileRouter);
router.use("/categories", categoryRouter);
router.use("/words", wordRouter);

export default router;
