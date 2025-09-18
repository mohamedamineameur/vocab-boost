import { UserCategory } from "../models/user-category.model";
import { Category } from "../models/category.model"
import { User } from "../models/user.model";
import { Request, Response } from "express";
import { paramsValidator } from "../validations/bodyValidator.ts";
import { idParamSchema } from "../validations/params.schemas.ts";
import { userCategorySchema } from "../validations/user-category.schemas.ts";
import { getScopeWhere } from "../middlewares/getScope.ts";

export const createUserCategory = async (req: Request, res: Response) => {
  try {
    const { userId, categoryId } = req.params;
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

    if (scope.user.id.toString() !== userId) {
      return res.status(403).json({ error: { en: "Forbidden", fr: "Interdit", es: "Prohibido", ar: "محظور" } });
    }

    const error = paramsValidator(req.params, userCategorySchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ error: { en: "Invalid userId", fr: "userId invalide", es: "userId inválido", ar: "معرف المستخدم غير صالح" } });
    }

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ error: { en: "Invalid categoryId", fr: "categoryId invalide", es: "categoryId inválido", ar: "معرف الفئة غير صالح" } });
    }

    // Check if the UserCategory association already exists
    const existingUserCategory = await UserCategory.findOne({ where: { userId, categoryId } });
    if (existingUserCategory) {
      return res.status(400).json({ error: { en: "This category is already associated with the user", fr: "Cette catégorie est déjà associée à l'utilisateur", es: "Esta categoría ya está asociada con el usuario", ar: "تم ربط هذه الفئة بالفعل بالمستخدم" } });
    }

    const userCategory = await UserCategory.create({
      userId,
      categoryId,
    });

    return res.status(201).json({ message: { en: "UserCategory created successfully", fr: "UserCategory créé avec succès", es: "UserCategory creado con éxito", ar: "تم إنشاء UserCategory بنجاح" }, userCategory });
  } catch (error) {
    console.error("Error creating UserCategory:", error);
    return res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const getUserCategories = async (req: Request, res: Response) => {
  try {
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

 

    // Check if user exists
    const user = await User.findByPk(scope.user.id);
    if (!user) {
      return res.status(400).json({ error: { en: "Invalid userId", fr: "userId invalide", es: "userId inválido", ar: "معرف المستخدم غير صالح" } });
    }

    const userCategories = await UserCategory.findAll({
      where: scope.where,
      include: [{
        model: Category, as: 'category'
      }],
    });

    return res.status(200).json({ userCategories });
  } catch (error) {
    console.error("Error fetching UserCategories:", error);
    return res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const getUserCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const scope = await getScopeWhere(req);
        if (!scope) {
          return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
        }
    
        const error = paramsValidator(req.params, idParamSchema);
        if (error.length > 0) {
          return res.status(400).json({ error });
        }
    
        const userCategory = await UserCategory.findOne({
          where: {id, ...scope.where},
          include: [{
            model: Category, as: 'category'
          }],
        });
    
        if (!userCategory) {
          return res.status(404).json({ error: { en: "UserCategory not found", fr: "UserCategory non trouvé", es: "UserCategory no encontrado", ar: "لم يتم العثور على UserCategory" } });
        }
    
       
        return res.status(200).json({ userCategory });
      } catch (error) {
        console.error("Error fetching UserCategory:", error);
        return res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
      }
    };