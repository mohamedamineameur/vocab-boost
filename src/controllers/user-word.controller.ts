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
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (scope.user.id.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const error = paramsValidator(req.params, userWordSchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    // Check if word exists
    const word = await Word.findByPk(wordId);
    if (!word) {
      return res.status(400).json({ error: "Invalid wordId" });
    }

    // Check if the UserWord association already exists
    const existingUserWord = await UserWord.findOne({ where: { userId, wordId } });
    if (existingUserWord) {
      return res.status(400).json({ error: "This word is already associated with the user" });
    }

    const userWord = await UserWord.create({
      userId,
      wordId,
    });

   const quizzes = await generateQuizs(userWord.id, req);

    return res.status(201).json({ message: "UserWord created successfully", userWord, quizzes });
  } catch (error) {
    console.error("Error creating UserWord:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserWords = async (req: Request, res: Response) => {
  try {
    const scope = await getScopeWhere(req);
    if (!scope) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userWords = await UserWord.findAll({
      where: scope.where,
      include: [Word],
    });

    return res.status(200).json(userWords);
  } catch (error) {
    console.error("Error fetching UserWords:", error);
    return res.status(500).json({ error: "Internal server error" });
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
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userWord = await UserWord.findOne({
      where: { id, ...scope.where },
      include: [Word],
    });

    if (!userWord) {
      return res.status(404).json({ error: "UserWord not found" });
    }

    return res.status(200).json(userWord);
  } catch (error) {
    console.error("Error fetching UserWord:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
