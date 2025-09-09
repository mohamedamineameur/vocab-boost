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
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
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

    return res.status(200).json({ message: "Session created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const destroySession = async (req: Request, res: Response) => {
  try {
    const cookie = req.cookies?.session;
    if (!cookie) {
      return res.status(401).json({ message: "Session cookie missing" });
    }

    const [sessionId, token] = cookie.split(":");
    if (!sessionId || !token) {
      return res.status(401).json({ message: "Invalid session cookie format" });
    }

    const session = await Session.findByPk(sessionId);
    if (!session) {
      return res.status(401).json({ message: "Invalid session token" });
    }

    await session.destroy();
    res.clearCookie("session", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Session destroyed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const cookie = req.cookies?.session;
    if (!cookie) {
      return res.status(401).json({ message: "Session cookie missing" });
    }

    const [sessionId, token] = cookie.split(":");
    if (!sessionId || !token) {
      return res.status(401).json({ message: "Invalid session cookie format" });
    }

    const session = await Session.findByPk(sessionId);
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    // 🔑 Vérification du token brut vs hash en DB
    const isValid = await bcrypt.compare(token, session.token);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid session token" });
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
      return res.status(401).json({ message: "Invalid session user" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
