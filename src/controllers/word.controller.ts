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
     return res.status(400).json({ error: "Invalid categoryId" });
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

   return res.status(201).json({ message: "Word created successfully"});
  } catch (error) {
    console.error("Error creating word:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getWords = async (req: Request, res: Response) => {
  try {
    const words = await Word.findAll();
    return res.status(200).json(words);
  } catch (error) {
    console.error("Error fetching words:", error);
    return res.status(500).json({ error: "Internal server error" });
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
      return res.status(404).json({ message: "Word not found" });
    }
    return res.status(200).json(word);
  } catch (error) {
    console.error("Error fetching word:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
