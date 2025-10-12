import { Router } from "express";
import { getAuditLogs, getUserAuditLogs, getAuditStats } from "../controllers/audit-log.controller.ts";
import { isAuthenticated } from "../middlewares/isAuthenticated.ts";

const auditLogRouter = Router();

// Routes admin uniquement
auditLogRouter.get("/", isAuthenticated("admin"), getAuditLogs);
auditLogRouter.get("/stats", isAuthenticated("admin"), getAuditStats);
auditLogRouter.get("/user/:userId", isAuthenticated("admin"), getUserAuditLogs);

export default auditLogRouter;

