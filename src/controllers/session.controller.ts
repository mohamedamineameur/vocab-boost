import Session from "../models/session.model.ts";
import type { Request, Response } from "express";
import env from "../config/env.ts";
import { User } from "../models/user.model.ts";
import bcrypt from "bcrypt";
import { bodyValidator } from "../validations/bodyValidator.ts";
import { sessionCreationSchema } from "../validations/session.schemas.ts";
import crypto from "crypto";
import { sendMFACode } from "../utils/emailService.ts";

export const createSession = async (req: Request, res: Response) => {
  try {
       const cookie = req.cookies?.session;
    if (cookie) {
      const [sessionId] = cookie.split(":");
      const existingSession = await Session.findByPk(sessionId);
      if (existingSession) {
        existingSession.destroy();
      }
    }


    
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

    // Vérifier si l'email est vérifié
    if (!user.isVerified) {
      return res.status(403).json({ 
        error: { 
          en: "Please verify your email address before logging in. Check your inbox for the verification link.", 
          fr: "Veuillez vérifier votre adresse email avant de vous connecter. Consultez votre boîte de réception pour le lien de vérification.", 
          es: "Por favor, verifica tu dirección de correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada para el enlace de verificación.", 
          ar: "يرجى التحقق من عنوان بريدك الإلكتروني قبل تسجيل الدخول. تحقق من صندوق الوارد الخاص بك للحصول على رابط التحقق." 
        },
        emailNotVerified: true 
      });
    }

    // Générer un code MFA de 6 chiffres
    const mfaCode = crypto.randomInt(100000, 999999).toString();
    const hashedCode = await bcrypt.hash(mfaCode, env.SALT_ROUNDS || 10);

    // Stocker le code hashé et sa date d'expiration (10 minutes)
    user.oneTimePassword = hashedCode;
    user.otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Envoyer le code par email
    await sendMFACode(user.email, mfaCode, user.firstname);

    return res.status(200).json({ 
      message: { 
        en: "Verification code sent to your email", 
        fr: "Code de vérification envoyé à votre email", 
        es: "Código de verificación enviado a tu correo", 
        ar: "تم إرسال رمز التحقق إلى بريدك الإلكتروني" 
      },
      mfaRequired: true,
      userId: user.id
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const verifyMFACode = async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;
    const ip = req.ip || "unknown";
    const userAgent = req.get("User-Agent") || "unknown";

    if (!userId || !code) {
      return res.status(400).json({ 
        error: { 
          en: "User ID and verification code are required", 
          fr: "L'ID utilisateur et le code de vérification sont requis", 
          es: "Se requiere el ID de usuario y el código de verificación", 
          ar: "معرف المستخدم ورمز التحقق مطلوبان" 
        } 
      });
    }

    // Trouver l'utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        error: { 
          en: "User not found", 
          fr: "Utilisateur non trouvé", 
          es: "Usuario no encontrado", 
          ar: "المستخدم غير موجود" 
        } 
      });
    }

    // Vérifier si un code OTP existe
    if (!user.oneTimePassword || !user.otpExpiration) {
      return res.status(400).json({ 
        error: { 
          en: "No verification code found. Please log in again.", 
          fr: "Aucun code de vérification trouvé. Veuillez vous reconnecter.", 
          es: "No se encontró código de verificación. Por favor, inicia sesión de nuevo.", 
          ar: "لم يتم العثور على رمز التحقق. يرجى تسجيل الدخول مرة أخرى." 
        } 
      });
    }

    // Vérifier si le code a expiré
    if (user.otpExpiration < new Date()) {
      user.oneTimePassword = undefined;
      user.otpExpiration = undefined;
      await user.save();

      return res.status(400).json({ 
        error: { 
          en: "Verification code has expired. Please log in again.", 
          fr: "Le code de vérification a expiré. Veuillez vous reconnecter.", 
          es: "El código de verificación ha expirado. Por favor, inicia sesión de nuevo.", 
          ar: "انتهت صلاحية رمز التحقق. يرجى تسجيل الدخول مرة أخرى." 
        } 
      });
    }

    // Vérifier le code
    const isCodeValid = await bcrypt.compare(code, user.oneTimePassword);
    if (!isCodeValid) {
      return res.status(401).json({ 
        error: { 
          en: "Invalid verification code", 
          fr: "Code de vérification invalide", 
          es: "Código de verificación inválido", 
          ar: "رمز التحقق غير صالح" 
        } 
      });
    }

    // Code valide ! Créer la session
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

    // Nettoyer le code OTP
    user.oneTimePassword = undefined;
    user.otpExpiration = undefined;
    await user.save();

    // Créer le cookie de session
    res.cookie("session", `${session.id}:${token}`, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: sessionExpiration * 3600000,
    });

    return res.status(200).json({ 
      message: { 
        en: "Session created successfully", 
        fr: "Session créée avec succès", 
        es: "Sesión creada con éxito", 
        ar: "تم إنشاء الجلسة بنجاح" 
      } 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
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

export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const cookie = req.cookies?.session;
    if (!cookie) {
      return res.status(401).json({ 
        error: { 
          en: "Session cookie missing", 
          fr: "Cookie de session manquant", 
          es: "Cookie de sesión faltante", 
          ar: "ملف تعريف الارتباط للجلسة مفقود" 
        } 
      });
    }

    const [sessionId] = cookie.split(":");
    const currentSession = await Session.findByPk(sessionId);
    
    if (!currentSession) {
      return res.status(401).json({ 
        error: { 
          en: "Invalid session", 
          fr: "Session invalide", 
          es: "Sesión inválida", 
          ar: "جلسة غير صالحة" 
        } 
      });
    }

    // Récupérer toutes les sessions de l'utilisateur
    const sessions = await Session.findAll({
      where: { userId: currentSession.userId },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'ip', 'userAgent', 'createdAt', 'expiresAt']
    });

    // Marquer la session actuelle
    const sessionsWithCurrent = sessions.map(s => ({
      id: s.id,
      ip: s.ip,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isCurrent: s.id === sessionId
    }));

    return res.status(200).json({ sessions: sessionsWithCurrent });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
  }
};

export const destroySessionById = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const cookie = req.cookies?.session;
    
    if (!cookie) {
      return res.status(401).json({ 
        error: { 
          en: "Session cookie missing", 
          fr: "Cookie de session manquant", 
          es: "Cookie de sesión faltante", 
          ar: "ملف تعريف الارتباط للجلسة مفقود" 
        } 
      });
    }

    const [currentSessionId] = cookie.split(":");
    const currentSession = await Session.findByPk(currentSessionId);
    
    if (!currentSession) {
      return res.status(401).json({ 
        error: { 
          en: "Invalid session", 
          fr: "Session invalide", 
          es: "Sesión inválida", 
          ar: "جلسة غير صالحة" 
        } 
      });
    }

    // Trouver la session à supprimer
    const sessionToDelete = await Session.findByPk(sessionId);
    
    if (!sessionToDelete) {
      return res.status(404).json({ 
        error: { 
          en: "Session not found", 
          fr: "Session non trouvée", 
          es: "Sesión no encontrada", 
          ar: "الجلسة غير موجودة" 
        } 
      });
    }

    // Vérifier que la session appartient bien à l'utilisateur
    if (sessionToDelete.userId !== currentSession.userId) {
      return res.status(403).json({ 
        error: { 
          en: "Forbidden", 
          fr: "Accès interdit", 
          es: "Prohibido", 
          ar: "محظور" 
        } 
      });
    }

    await sessionToDelete.destroy();

    // Si l'utilisateur supprime sa session actuelle, effacer le cookie
    if (sessionId === currentSessionId) {
      res.clearCookie("session", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
    }

    return res.status(200).json({ 
      message: { 
        en: "Session revoked successfully", 
        fr: "Session révoquée avec succès", 
        es: "Sesión revocada con éxito", 
        ar: "تم إلغاء الجلسة بنجاح" 
      } 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
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
