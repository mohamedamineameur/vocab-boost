import Session from "../models/session.model.ts";
import type { Request, Response } from "express";
import env from "../config/env.ts";
import { User } from "../models/user.model.ts";
import bcrypt from "bcrypt";
import { bodyValidator } from "../validations/bodyValidator.ts";
import { sessionCreationSchema } from "../validations/session.schemas.ts";
import crypto from "crypto";

export const createSession = async (req: Request, res: Response) => {
  try {
    const error = bodyValidator(req.body, sessionCreationSchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }
    const { email, password } = req.body;
    const ip = req.ip || "unknown";
    const userAgent = req.get("User-Agent") || "unknown";

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: { en: "Invalid email or password", fr: "Email ou mot de passe invalide", es: "Correo electrónico o contraseña inválidos", ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة" } });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: { en: "Invalid email or password", fr: "Email ou mot de passe invalide", es: "Correo electrónico o contraseña inválidos", ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة" } });
    }

    const token = crypto.randomBytes(64).toString("hex");
    const hashedToken = await bcrypt.hash(token, env.SALT_ROUNDS || 10);

    const sessionExpiration = parseInt(String(env.SESSION_EXPIRATION ?? "1"), 10);
const session = await Session.create({
    userId: user.id,
    token: hashedToken,
    expiresAt: new Date(Date.now() + sessionExpiration * 3600000),
    ip,
    userAgent,
 });


res.cookie("session", `${session.id}:${token}`, {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: sessionExpiration * 3600000,
});

    return res.status(200).json({ message: { en: "Session created successfully", fr: "Session créée avec succès", es: "Sesión creada con éxito", ar: "تم إنشاء الجلسة بنجاح" } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const destroySession = async (req: Request, res: Response) => {
  try {
    const cookie = req.cookies?.session;
    if (!cookie) {
      return res.status(401).json({ error: { en: "Session cookie missing", fr: "Cookie de session manquant", es: "Cookie de sesión faltante", ar: "ملف تعريف الارتباط للجلسة مفقود" } });
    }

    const [sessionId, token] = cookie.split(":");
    if (!sessionId || !token) {
      return res.status(401).json({ error: { en: "Invalid session cookie format", fr: "Format de cookie de session invalide", es: "Formato de cookie de sesión inválido", ar: "تنسيق ملف تعريف الارتباط للجلسة غير صالح" } });
    }

    const session = await Session.findByPk(sessionId);
    if (!session) {
      return res.status(401).json({ error: { en: "Invalid session token", fr: "Jeton de session invalide", es: "Token de sesión inválido", ar: "رمز الجلسة غير صالح" } });
    }

    await session.destroy();
    res.clearCookie("session", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: { en: "Session destroyed successfully", fr: "Session détruite avec succès", es: "Sesión destruida con éxito", ar: "تم تدمير الجلسة بنجاح" } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const cookie = req.cookies?.session;
    if (!cookie) {
      return res.status(401).json({ error: { en: "Session cookie missing", fr: "Cookie de session manquant", es: "Cookie de sesión faltante", ar: "ملف تعريف الارتباط للجلسة مفقود" } });
    }

    const [sessionId, token] = cookie.split(":");
    if (!sessionId || !token) {
      return res.status(401).json({ error: { en: "Invalid session cookie format", fr: "Format de cookie de session invalide", es: "Formato de cookie de sesión inválido", ar: "تنسيق ملف تعريف الارتباط للجلسة غير صالح" } });
    }

    const session = await Session.findByPk(sessionId);
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: { en: "Invalid or expired session", fr: "Session invalide ou expirée", es: "Sesión inválida o expirada", ar: "جلسة غير صالحة أو منتهية" } });
    }

    // 🔑 Vérification du token brut vs hash en DB
    const isValid = await bcrypt.compare(token, session.token);
    if (!isValid) {
      return res.status(401).json({ error: { en: "Invalid session token", fr: "Jeton de session invalide", es: "Token de sesión inválido", ar: "رمز الجلسة غير صالح" } });
    }

    // Si token OK → on charge l’utilisateur
    const user = await User.findByPk(session.userId, {
      attributes: {
        exclude: [
          "password",
          "verificationToken",
          "oneTimePassword",
          "otpExpiration",
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: { en: "Invalid session user", fr: "Utilisateur de session invalide", es: "Usuario de sesión inválido", ar: "مستخدم الجلسة غير صالح" } });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};
