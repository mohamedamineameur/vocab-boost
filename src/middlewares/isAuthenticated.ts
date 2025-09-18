// middlewares/isAuthenticated.ts
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model.ts";
import { Session } from "../models/session.model.ts";
import bcrypt from "bcrypt";


export function isAuthenticated(role?: "admin") {
  return async (req: Request, res: Response, next: NextFunction) => {
   const cookie = req.cookies?.session;
    if (!cookie) {
      return res.status(401).json({ error: { en: "Authentication required", fr: "Authentification requise", es: "Se requiere autenticación", ar: "مطلوب مصادقة" } });
    }

    const [sessionId, token] = cookie.split(":");
    if (!sessionId || !token) {
      return res.status(401).json({ error: { en: "Invalid session cookie format", fr: "Format de cookie de session invalide", es: "Formato de cookie de sesión no válido", ar: "تنسيق ملف تعريف الارتباط للجلسة غير صالح" } });
    }
    try {
      const session = await Session.findByPk(sessionId);
      if (!session) {
        return res.status(401).json({ error: { en: "Invalid session", fr: "Session invalide", es: "Sesión no válida", ar: "جلسة غير صالحة" } });
      }

      const isTokenValid = await bcrypt.compare(token, session.token);
      if (!isTokenValid) {
        return res.status(401).json({ error: { en: "Invalid session token", fr: "Jeton de session invalide", es: "Token de sesión no válido", ar: "رمز الجلسة غير صالح" } });
      }

      if (role === "admin") {
        const user = await User.findByPk(session.userId);
        if (!user || !user.isAdmin) {
          return res.status(403).json({ error: { en: "Admin access required", fr: "Accès administrateur requis", es: "Se requiere acceso de administrador", ar: "مطلوب وصول المسؤول" } });
        }
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: { en: "Invalid token", fr: "Jeton invalide", es: "Token inválido", ar: "رمز غير صالح" } });
    }
  };
}
