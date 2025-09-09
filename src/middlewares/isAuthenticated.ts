// middlewares/isAuthenticated.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env.ts";
import { User } from "../models/user.model.ts";
import { Session } from "../models/session.model.ts";
import bcrypt from "bcrypt";


export function isAuthenticated(role?: "admin") {
  return async (req: Request, res: Response, next: NextFunction) => {
   const cookie = req.cookies?.session;
    if (!cookie) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [sessionId, token] = cookie.split(":");
    if (!sessionId || !token) {
      return res.status(401).json({ message: "Invalid session cookie format" });
    }
    try {
      const session = await Session.findByPk(sessionId);
      if (!session) {
        return res.status(401).json({ message: "Invalid session" });
      }

      const isTokenValid = await bcrypt.compare(token, session.token);
      if (!isTokenValid) {
        return res.status(401).json({ message: "Invalid session token" });
      }

      if (role === "admin") {
        const user = await User.findByPk(session.userId);
        if (!user || !user.isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}
