import { Profile } from "../models/profile.model.ts";
import { Request, Response } from "express";
import { bodyValidator, bodyWithParamsValidator, paramsValidator } from "../validations/bodyValidator.ts";
import { profileCreationSchema, updateProfileSchema } from "../validations/profile.schemas.ts";
import { idParamSchema } from "../validations/params.schemas.ts";
import { getScopeWhere } from "../middlewares/getScope.ts";

export const createProfile = async (req: Request, res: Response) => {
  try {
    const error = bodyValidator(req.body, profileCreationSchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }

    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

    if (scope.user.id.toString() !== req.body.userId) {
      return res.status(403).json({ error: { en: "Forbidden", fr: "Interdit", es: "Prohibido", ar: "محظور" } });
    }

    const { userId, local, theme } = req.body;

    // Check if profile already exists for the user
    const existingProfile = await Profile.findOne({ where: { userId } });
    if (existingProfile) {
      return res.status(400).json({ error: { en: "Profile already exists for this user", fr: "Le profil existe déjà pour cet utilisateur", es: "El perfil ya existe para este usuario", ar: "يوجد ملف تعريف بالفعل لهذا المستخدم" } });
    }

    const newProfile = await Profile.create({
      userId,
      local: local || 'en',
      theme: theme || 'light',
    });

    res.status(201).json({ message: { en: "Profile created successfully", fr: "Profil créé avec succès", es: "Perfil creado con éxito", ar: "تم إنشاء الملف الشخصي بنجاح" }, profileId: newProfile.id });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const getProfiles = async (req: Request, res: Response) => {
  try {
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }
    const profiles = await Profile.findAll(
      { where: scope.where } 
    );
    res.status(200).json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }
    const profile = await Profile.findOne({ where: { userId: scope.user.id } });
    if (!profile) {
      return res.status(404).json({ error: { en: "Profile not found", fr: "Profil non trouvé", es: "Perfil no encontrado", ar: "الملف الشخصي غير موجود" } });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const getProfileById = async (req: Request, res: Response) => {
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
    const profile = await Profile.findByPk(id);
    if (!profile || (scope.where && !Object.entries(scope.where).every(([key, value]) => (profile as any)[key] === value))) {
      return res.status(404).json({ error: { en: "Profile not found", fr: "Profil non trouvé", es: "Perfil no encontrado", ar: "الملف الشخصي غير موجود" } });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
}
export const updateProfilePartialOrFull = async (req: Request, res: Response) => {
  try {
    const error = bodyWithParamsValidator(req.body, updateProfileSchema, req.params, idParamSchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }
    const { id } = req.params;
    const { local, theme } = req.body;
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }


    const profile = await Profile.findByPk(id);
    
    if (!profile) {
      return res.status(404).json({ error: { en: "Profile not found", fr: "Profil non trouvé", es: "Perfil no encontrado", ar: "الملف الشخصي غير موجود" } });
    }
    if (profile.userId !== scope.user.id && !scope.user.isAdmin) {
      return res.status(403).json({ error: { en: "Forbidden", fr: "Interdit", es: "Prohibido", ar: "محظور" } });
    }

    if (local !== undefined) profile.local = local;
    if (theme !== undefined) profile.theme = theme;

    await profile.save();
    res.status(200).json({ message: { en: "Profile updated successfully", fr: "Profil mis à jour avec succès", es: "Perfil actualizado con éxito", ar: "تم تحديث الملف الشخصي بنجاح" }, profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const error = bodyValidator(req.body, updateProfileSchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }
    const { local, theme } = req.body;
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

    const profile = await Profile.findOne({ where: { userId: scope.user.id } });
    
    if (!profile) {
      return res.status(404).json({ error: { en: "Profile not found", fr: "Profil non trouvé", es: "Perfil no encontrado", ar: "الملف الشخصي غير موجود" } });
    }

    if (local !== undefined) profile.local = local;
    if (theme !== undefined) profile.theme = theme;

    await profile.save();
    res.status(200).json({ message: { en: "Profile updated successfully", fr: "Profil mis à jour avec succès", es: "Perfil actualizado con éxito", ar: "تم تحديث الملف الشخصي بنجاح" }, profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const error = paramsValidator(req.params, idParamSchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }
    const scope = await getScopeWhere(req);
    const profile = await Profile.findByPk(id);
    if (!profile) {
      return res.status(404).json({ error: { en: "Profile not found", fr: "Profil non trouvé", es: "Perfil no encontrado", ar: "الملف الشخصي غير موجود" } });
    }
    if (!scope || (profile.userId !== scope.user.id && !scope.user.isAdmin)) {
      return res.status(403).json({ error: { en: "Forbidden", fr: "Interdit", es: "Prohibido", ar: "محظور" } });
    }
    await profile.destroy();
    res.status(200).json({ message: { en: "Profile deleted successfully", fr: "Profil supprimé avec succès", es: "Perfil eliminado con éxito", ar: "تم حذف الملف الشخصي بنجاح" } });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
}