import env from '../config/env.ts';
import type { Request } from 'express';
import type { Response } from 'express';
import { User } from '../models/user.model.ts';
import bcrypt from 'bcrypt';
import { bodyValidator, bodyWithParamsValidator, paramsValidator } from '../validations/bodyValidator.ts';
import { userCreationSchema, updateUserSchema } from '../validations/user.schemas.ts';
import { idParamSchema } from '../validations/params.schemas.ts';
import { getScopeWhere } from "../middlewares/getScope.ts";

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

    // Create new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      isVerified: false,
    });

    res.status(201).json({ message: { en: "User created successfully", fr: "Utilisateur créé avec succès", es: "Usuario creado con éxito", ar: "تم إنشاء المستخدم بنجاح" }, userId: newUser.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'verificationToken', 'oneTimePassword', 'otpExpiration'] },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const error = paramsValidator(req.params, idParamSchema);
    if (error.length > 0) {
      return res.status(400).json({ error }); 
    }

    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

    const { user } = scope;

    // Vérification de l’accès
    if (user.isAdmin || user.id.toString() === id) {
      const targetUser = await User.findOne({
        where: { id },
        attributes: { 
          exclude: ["password", "verificationToken", "oneTimePassword", "otpExpiration"] 
        }
      });

      if (!targetUser) {
        return res.status(404).json({ error: { en: "User not found", fr: "Utilisateur non trouvé", es: "Usuario no encontrado", ar: "المستخدم غير موجود" } });
      }

      return res.status(200).json(targetUser);
    }

    return res.status(403).json({ error: { en: "Forbidden", fr: "Interdit", es: "Prohibido", ar: "محظور" } });

  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};



export const updateUserPartialOrFull = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const error = bodyWithParamsValidator(req.body, updateUserSchema, req.params, idParamSchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }

    const { email, password, firstname, lastname, newPassword, passwordConfirmation } = req.body;

    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

    const { user } = scope; 

    if (!user.isAdmin && user.id.toString() !== id) {
      return res.status(403).json({ error: { en: "Forbidden", fr: "Interdit", es: "Prohibido", ar: "محظور" } });
    }

    const targetUser = await User.findByPk(id);
    if (!targetUser) {
      return res.status(404).json({ error: { en: "User not found", fr: "Utilisateur non trouvé", es: "Usuario no encontrado", ar: "المستخدم غير موجود" } });
    }

    if (password) {
      const isMatch = await bcrypt.compare(password, targetUser.password);
      if (!isMatch) {
        return res.status(400).json({ error: { en: "Old password is incorrect", fr: "L'ancien mot de passe est incorrect", es: "La contraseña anterior es incorrecta", ar: "كلمة المرور القديمة غير صحيحة" } });
      }
    }

    if (newPassword && newPassword !== passwordConfirmation) {
      return res.status(400).json({ error: { en: "New password confirmation does not match", fr: "La confirmation du nouveau mot de passe ne correspond pas", es: "La confirmación de la nueva contraseña no coincide", ar: "تأكيد كلمة المرور الجديدة لا يتطابق" } });
    }

    let hashedPassword = targetUser.password;
    if (newPassword) {
      const saltRounds = env.SALT_ROUNDS || 10;
      hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    }

    await targetUser.update({
      email: email || targetUser.email,
      password: hashedPassword || targetUser.password,
      firstname: firstname || targetUser.firstname,
      lastname: lastname || targetUser.lastname,
    });

    res.status(200).json({ message: { en: "User updated successfully", fr: "Utilisateur mis à jour avec succès", es: "Usuario actualizado con éxito", ar: "تم تحديث المستخدم بنجاح" } });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};


export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const error = paramsValidator(req.params, idParamSchema);
    if (error.length > 0) {
      return res.status(400).json({ error }); 
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: { en: "User not found", fr: "Utilisateur non trouvé", es: "Usuario no encontrado", ar: "المستخدم غير موجود" } });
    }

    await user.destroy();
    res.status(200).json({ message: { en: "User deleted successfully", fr: "Utilisateur supprimé avec succès", es: "Usuario eliminado con éxito", ar: "تم حذف المستخدم بنجاح" } });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};
