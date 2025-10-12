import { Router } from "express";
import { createSession, destroySession, getMe, verifyMFACode, getUserSessions, destroySessionById } from "../controllers/session.controller.ts";

const sessionRouter = Router();

sessionRouter.post("/", createSession);
sessionRouter.post("/verify-mfa", verifyMFACode);
sessionRouter.get("/", getUserSessions);
sessionRouter.delete("/", destroySession);
sessionRouter.delete("/:sessionId", destroySessionById);
sessionRouter.get("/me", getMe);

export default sessionRouter;
