import { Word, WordCreationAttributes  } from "../models/word.model.ts";
import { Category } from "../models/category.model.ts";
import { Request, Response } from "express";
import { bodyValidator, paramsValidator } from "../validations/bodyValidator.ts";
import { wordCreationSchema } from "../validations/word.schemas.ts";
import { idParamSchema } from "../validations/params.schemas.ts";

export const createWord = async (req: Request, res: Response) => {
  try {
    const error = bodyValidator(req.body, wordCreationSchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }
   const { text, meaning, example, categoryId, frTranslation, esTranslation, arTranslation, synonyms, antonyms, lexicalField, level, pronunciation } = req.body;

   // Check if category exists
   const category = await Category.findByPk(categoryId);
   if (!category) {
     return res.status(400).json({ error: { en: "Invalid categoryId", fr: "ID de catégorie invalide", es: "ID de categoría no válido", ar: "معرف الفئة غير صالح" } });
   }

   const word = await Word.create({
     text,
     meaning,
     example,
     categoryId,
     frTranslation,
     esTranslation,
     arTranslation,
     synonyms,
     antonyms,
     lexicalField,
     level,
     pronunciation,
     
   });

   return res.status(201).json({ message: { en: "Word created successfully", fr: "Mot créé avec succès", es: "Palabra creada con éxito", ar: "تم إنشاء الكلمة بنجاح" } });
  } catch (error) {
    console.error("Error creating word:", error);
    return res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const getWords = async (req: Request, res: Response) => {
  try {
    const words = await Word.findAll();
    return res.status(200).json(words);
  } catch (error) {
    console.error("Error fetching words:", error);
    return res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};

export const getWordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const error = paramsValidator(req.params, idParamSchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }
    const word = await Word.findByPk(id);
    if (!word) {
      return res.status(404).json({ error: { en: "Word not found", fr: "Mot non trouvé", es: "Palabra no encontrada", ar: "الكلمة غير موجودة" } });
    }
    return res.status(200).json(word);
  } catch (error) {
    console.error("Error fetching word:", error);
    return res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
  }
};
