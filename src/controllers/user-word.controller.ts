import { UserWord } from "../models/user-word.model";
import { Word } from "../models/word.model";
import { User } from "../models/user.model";
import { Request, Response } from "express";
import { paramsValidator } from "../validations/bodyValidator.ts";
import { idParamSchema } from "../validations/params.schemas.ts";
import { userWordSchema } from "../validations/user-word.schmemas.ts";
import { getScopeWhere } from "../middlewares/getScope.ts";
import { generateQuizs } from "../utils/quizInitiate.ts";

export const createUserWord = async (req: Request, res: Response) => {
  try {
    const { userId, wordId } = req.params;
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

    if (scope.user.id.toString() !== userId) {
      return res.status(403).json({ error: { en: "Forbidden", fr: "Interdit", es: "Prohibido", ar: "محظور" } });
    }

    const error = paramsValidator(req.params, userWordSchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ error: { en: "Invalid userId", fr: "userId invalide", es: "userId inválido", ar: "معرف المستخدم غير صالح" } });
    }

    // Check if word exists
    const word = await Word.findByPk(wordId);
    if (!word) {
      return res.status(400).json({ error: { en: "Invalid wordId", fr: "wordId invalide", es: "wordId inválido", ar: "معرف الكلمة غير صالح" } });
    }

    // Check if the UserWord association already exists
    const existingUserWord = await UserWord.findOne({ where: { userId, wordId } });
    if (existingUserWord) {
      return res.status(400).json({ error: { en: "This word is already associated with the user", fr: "Ce mot est déjà associé à l'utilisateur", es: "Esta palabra ya está asociada con el usuario", ar: "تم ربط هذه الكلمة بالفعل بالمستخدم" } });
    }

    const userWord = await UserWord.create({
      userId,
      wordId,
    });

   const quizzes = await generateQuizs(userWord.id, req);

    return res.status(201).json({ message: { en: "UserWord created successfully", fr: "UserWord créé avec succès", es: "UserWord creado con éxito", ar: "تم إنشاء UserWord بنجاح" }, userWord, quizzes });
  } catch (error) {
    console.error("Error creating UserWord:", error);
    return res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const getUserWords = async (req: Request, res: Response) => {
  try {
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
    }

    const userWords = await UserWord.findAll({
      where: scope.where,
      include: [{
        model: Word, as: 'word'
      }],
    });

    return res.status(200).json(userWords);
  } catch (error) {
    console.error("Error fetching UserWords:", error);
    return res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const getUserWordById = async (req: Request, res: Response) => {
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

    const userWord = await UserWord.findOne({
      where: { id, ...scope.where },
      include: [
        { model: Word, as: 'word' }
      ],
    });

    if (!userWord) {
      return res.status(404).json({ error: { en: "UserWord not found", fr: "UserWord non trouvé", es: "UserWord no encontrado", ar: "UserWord غير موجود" } });
    }

    return res.status(200).json(userWord);
  } catch (error) {
    console.error("Error fetching UserWord:", error);
    return res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};
