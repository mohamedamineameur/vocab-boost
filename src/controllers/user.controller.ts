import env from '../config/env.ts';
import type { Request } from 'express';
import type { Response } from 'express';
import { User } from '../models/user.model.ts';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { bodyValidator, bodyWithParamsValidator, paramsValidator } from '../validations/bodyValidator.ts';
import { userCreationSchema, updateUserSchema } from '../validations/user.schemas.ts';
import { idParamSchema } from '../validations/params.schemas.ts';
import { getScopeWhere } from "../middlewares/getScope.ts";
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.ts';

export const createUser = async (req: Request, res: Response) => {
  try {
    const error = bodyValidator(req.body, userCreationSchema);
    if (error.length > 0) {
      return res.status(400).json({ error }); 
    }
    const { email, password, firstname, lastname, passwordConfirmation } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
   if (existingUser) {
  return res.status(400).json({ error: { en: "User already exists", fr: "L'utilisateur existe déjà", es: "El usuario ya existe", ar: "المستخدم موجود بالفعل" } });
}
    

    // Validate password confirmation
    if (password !== passwordConfirmation) {
      return res.status(400).json({ error: { en: "Password confirmation does not match", fr: "La confirmation du mot de passe ne correspond pas", es: "La confirmación de la contraseña no coincide", ar: "تأكيد كلمة المرور غير متطابق" } });  
    }

    // Hash the password
    const saltRounds = env.SALT_ROUNDS || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      isVerified: false,
      verificationToken,
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken, newUser.id);

    res.status(201).json({ 
      message: { 
        en: "User created successfully! Please check your email to verify your account.", 
        fr: "Utilisateur créé avec succès! Veuillez vérifier votre email pour activer votre compte.", 
        es: "¡Usuario creado con éxito! Por favor, revisa tu correo para verificar tu cuenta.", 
        ar: "تم إنشاء المستخدم بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل حسابك." 
      },
      user: {
        id: newUser.id,
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        isVerified: newUser.isVerified,
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const error = paramsValidator(req.params, idParamSchema);
    if (error.length > 0) {
      return res.status(400).json({ error }); 
    }
    
    const { id } = req.params;
    const scopeResult = await getScopeWhere(req);
    if (!scopeResult) {
      return res.status(401).json({ 
        error: { 
          en: "Unauthorized", 
          fr: "Non autorisé", 
          es: "No autorizado", 
          ar: "غير مخول" 
        } 
      });
    }
    
    const whereClause = { ...scopeResult.where, id };
    
    const user = await User.findOne({ where: whereClause });
    
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

    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const scopeResult = await getScopeWhere(req);
    if (!scopeResult) {
      return res.status(401).json({ 
        error: { 
          en: "Unauthorized", 
          fr: "Non autorisé", 
          es: "No autorizado", 
          ar: "غير مخول" 
        } 
      });
    }
    
    const users = await User.findAll({ 
      where: scopeResult.where,
      attributes: ['id', 'email', 'firstname', 'lastname', 'isVerified', 'isAdmin', 'createdAt', 'updatedAt']
    });

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
  }
};

export const updateUserPartialOrFull = async (req: Request, res: Response) => {
  try {
    const error = bodyWithParamsValidator(req.body, req.params as Record<string, never>, updateUserSchema, idParamSchema);
    if (error.length > 0) {
      return res.status(400).json({ error }); 
    }
    
    const { id } = req.params;
    const updateData = req.body;
    const scopeResult = await getScopeWhere(req);
    if (!scopeResult) {
      return res.status(401).json({ 
        error: { 
          en: "Unauthorized", 
          fr: "Non autorisé", 
          es: "No autorizado", 
          ar: "غير مخول" 
        } 
      });
    }
    
    const whereClause = { ...scopeResult.where, id };
    const user = await User.findOne({ where: whereClause });
    
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

    // Hash password if provided
    if (updateData.password) {
      const saltRounds = env.SALT_ROUNDS || 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    await user.update(updateData);
    
    res.json({ 
      message: { 
        en: "User updated successfully", 
        fr: "Utilisateur mis à jour avec succès", 
        es: "Usuario actualizado con éxito", 
        ar: "تم تحديث المستخدم بنجاح" 
      },
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        updatedAt: user.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const error = paramsValidator(req.params, idParamSchema);
    if (error.length > 0) {
      return res.status(400).json({ error }); 
    }
    
    const { id } = req.params;
    const scopeResult = await getScopeWhere(req);
    if (!scopeResult) {
      return res.status(401).json({ 
        error: { 
          en: "Unauthorized", 
          fr: "Non autorisé", 
          es: "No autorizado", 
          ar: "غير مخول" 
        } 
      });
    }
    
    const whereClause = { ...scopeResult.where, id };
    const user = await User.findOne({ where: whereClause });
    
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

    await user.destroy();
    
    res.json({ 
      message: { 
        en: "User deleted successfully", 
        fr: "Utilisateur supprimé avec succès", 
        es: "Usuario eliminado con éxito", 
        ar: "تم حذف المستخدم بنجاح" 
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: { 
          en: "Unauthorized", 
          fr: "Non autorisé", 
          es: "No autorizado", 
          ar: "غير مخول" 
        } 
      });
    }

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

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ 
          error: { 
            en: "Email already exists", 
            fr: "Cet email existe déjà", 
            es: "Este correo ya existe", 
            ar: "هذا البريد الإلكتروني موجود بالفعل" 
          } 
        });
      }
    }

    await user.update({ firstname, lastname, email });

    res.json({ 
      message: { 
        en: "Profile updated successfully", 
        fr: "Profil mis à jour avec succès", 
        es: "Perfil actualizado con éxito", 
        ar: "تم تحديث الملف الشخصي بنجاح" 
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: { 
          en: "Unauthorized", 
          fr: "Non autorisé", 
          es: "No autorizado", 
          ar: "غير مخول" 
        } 
      });
    }

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

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        error: { 
          en: "Current password is incorrect", 
          fr: "L'ancien mot de passe est incorrect", 
          es: "La contraseña actual es incorrecta", 
          ar: "كلمة المرور الحالية غير صحيحة" 
        } 
      });
    }

    // Vérifier que les nouveaux mots de passe correspondent
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        error: { 
          en: "Password confirmation does not match", 
          fr: "La confirmation du mot de passe ne correspond pas", 
          es: "La confirmación de la contraseña no coincide", 
          ar: "تأكيد كلمة المرور غير متطابق" 
        } 
      });
    }

    // Hash le nouveau mot de passe
    const saltRounds = env.SALT_ROUNDS || 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await user.update({ password: hashedNewPassword });

    res.json({ 
      message: { 
        en: "Password updated successfully", 
        fr: "Mot de passe mis à jour avec succès", 
        es: "Contraseña actualizada con éxito", 
        ar: "تم تحديث كلمة المرور بنجاح" 
      }
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { userId, verificationToken } = req.params;
 
    console.log(userId, verificationToken);

    // Validation des paramètres
    if (!userId || !verificationToken) {
      return res.status(400).json({ 
        error: { 
          en: "Missing required parameters", 
          fr: "Paramètres requis manquants", 
          es: "Faltan parámetros requeridos", 
          ar: "معاملات مطلوبة مفقودة" 
        } 
      });
    }

    // Trouver l'utilisateur avec le token de vérification
    const user = await User.findOne({ 
      where: { 
        id: userId, 
        verificationToken 
      } 
    });

    if (!user) {
      return res.status(400).json({ 
        error: { 
          en: "Invalid verification token", 
          fr: "Token de vérification invalide", 
          es: "Token de verificación inválido", 
          ar: "رمز التحقق غير صالح" 
        } 
      });
    }

    const newToken = crypto.randomBytes(32).toString('hex');

    // Mettre à jour l'utilisateur
    user.isVerified = true;
    user.verificationToken = newToken;
    await user.save();

    res.status(200).json({ 
      message: { 
        en: "Email verified successfully! You can now log in.", 
        fr: "Email vérifié avec succès! Vous pouvez maintenant vous connecter.", 
        es: "¡Correo electrónico verificado con éxito! Ahora puedes iniciar sesión.", 
        ar: "تم التحقق من البريد الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول." 
      },
      verified: true
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: { 
          en: "Email is required", 
          fr: "L'email est requis", 
          es: "El correo electrónico es requerido", 
          ar: "البريد الإلكتروني مطلوب" 
        } 
      });
    }

    // Trouver l'utilisateur par email
    const user = await User.findOne({ where: { email } });
    
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

    // Vérifier si l'utilisateur est déjà vérifié
    if (user.isVerified) {
      return res.status(400).json({ 
        error: { 
          en: "Email is already verified", 
          fr: "L'email est déjà vérifié", 
          es: "El correo electrónico ya está verificado", 
          ar: "البريد الإلكتروني محقق بالفعل" 
        } 
      });
    }

    // Générer un nouveau token de vérification
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Envoyer l'email de vérification
    await sendVerificationEmail(user.email, verificationToken, user.id);

    res.status(200).json({ 
      message: { 
        en: "Verification email sent successfully! Please check your inbox.", 
        fr: "Email de vérification envoyé avec succès! Veuillez vérifier votre boîte de réception.", 
        es: "¡Correo de verificación enviado con éxito! Por favor, revisa tu bandeja de entrada.", 
        ar: "تم إرسال بريد التحقق بنجاح! يرجى التحقق من صندوق الوارد." 
      }
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: { 
          en: "Email is required", 
          fr: "L'email est requis", 
          es: "El correo electrónico es requerido", 
          ar: "البريد الإلكتروني مطلوب" 
        } 
      });
    }

    // Trouver l'utilisateur par email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Pour la sécurité, on ne révèle pas si l'email existe ou non
      return res.status(200).json({ 
        message: { 
          en: "If an account with that email exists, a password reset link has been sent.", 
          fr: "Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.", 
          es: "Si existe una cuenta con ese correo electrónico, se ha enviado un enlace de restablecimiento.", 
          ar: "إذا كان هناك حساب بهذا البريد الإلكتروني، تم إرسال رابط إعادة تعيين كلمة المرور." 
        } 
      });
    }

    // Vérifier si l'utilisateur est vérifié
    if (!user.isVerified) {
      return res.status(400).json({ 
        error: { 
          en: "Please verify your email address first", 
          fr: "Veuillez d'abord vérifier votre adresse email", 
          es: "Por favor, verifica tu dirección de correo electrónico primero", 
          ar: "يرجى التحقق من عنوان بريدك الإلكتروني أولاً" 
        } 
      });
    }

    // Générer un token de réinitialisation (expire dans 1 heure)
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.verificationToken = resetToken;
    await user.save();

    // Envoyer l'email de réinitialisation
    await sendPasswordResetEmail(user.email, resetToken, user.id, user.firstname);

    res.status(200).json({ 
      message: { 
        en: "If an account with that email exists, a password reset link has been sent.", 
        fr: "Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.", 
        es: "Si existe una cuenta con ese correo electrónico, se ha enviado un enlace de restablecimiento.", 
        ar: "إذا كان هناك حساب بهذا البريد الإلكتروني، تم إرسال رابط إعادة تعيين كلمة المرور." 
      }
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { userId, resetToken } = req.params;
    const { password, passwordConfirmation } = req.body;

    if (!userId || !resetToken) {
      return res.status(400).json({ 
        error: { 
          en: "User ID and reset token are required", 
          fr: "L'ID utilisateur et le token de réinitialisation sont requis", 
          es: "Se requieren el ID de usuario y el token de restablecimiento", 
          ar: "معرف المستخدم ورمز إعادة التعيين مطلوبان" 
        } 
      });
    }

    if (!password || !passwordConfirmation) {
      return res.status(400).json({ 
        error: { 
          en: "Password and password confirmation are required", 
          fr: "Le mot de passe et la confirmation sont requis", 
          es: "La contraseña y la confirmación son requeridas", 
          ar: "كلمة المرور والتأكيد مطلوبان" 
        } 
      });
    }

    if (password !== passwordConfirmation) {
      return res.status(400).json({ 
        error: { 
          en: "Password confirmation does not match", 
          fr: "La confirmation du mot de passe ne correspond pas", 
          es: "La confirmación de la contraseña no coincide", 
          ar: "تأكيد كلمة المرور غير متطابق" 
        } 
      });
    }

    // Trouver l'utilisateur avec l'ID et le token valide
    const user = await User.findOne({ 
      where: { 
        id: userId,
        verificationToken: resetToken,
       
      } 
    });

    if (!user) {
      return res.status(400).json({ 
        error: { 
          en: "Invalid or expired reset token", 
          fr: "Token de réinitialisation invalide ou expiré", 
          es: "Token de restablecimiento inválido o expirado", 
          ar: "رمز إعادة التعيين غير صالح أو منتهي الصلاحية" 
        } 
      });
    }

    // Hash le nouveau mot de passe
    const saltRounds = env.SALT_ROUNDS || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Mettre à jour l'utilisateur
    user.password = hashedPassword;
    user.verificationToken = crypto.randomBytes(32).toString('hex');
   
    await user.save();

    res.status(200).json({ 
      message: { 
        en: "Password reset successfully! You can now log in with your new password.", 
        fr: "Mot de passe réinitialisé avec succès! Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.", 
        es: "¡Contraseña restablecida con éxito! Ahora puedes iniciar sesión con tu nueva contraseña.", 
        ar: "تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة." 
      }
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
  }
};