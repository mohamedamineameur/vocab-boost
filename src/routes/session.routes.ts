import { Router } from "express";
import { createSession, destroySession, getMe } from "../controllers/session.controller.ts";

const sessionRouter = Router();

sessionRouter.post("/", createSession);
sessionRouter.delete("/", destroySession);
sessionRouter.get("/me", getMe);

export default sessionRouter;
