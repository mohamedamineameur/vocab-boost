import Quiz from "../models/quiz.model.ts";
import { Request, Response } from "express";
import { UserWord } from "../models/user-word.model.ts";
import { idParamSchema } from "../validations/params.schemas.ts";
import { getScopeWhere } from "../middlewares/getScope.ts";
import { quizUpdateSchema } from "../validations/quiz.schemas.ts";
import { bodyWithParamsValidator } from "../validations/bodyValidator.ts";
import { Word } from "../models/word.model.ts";

export const getQuizzes = async (req: Request, res: Response) => {
    try {
        const scope = await getScopeWhere(req);
        if (!scope) {
            return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
        }

        const quizzes = await Quiz.findAll({
            include: [
                {
                    model: UserWord,
                    as: "userWord",
                    where: scope.where, 
                    required: !scope.user.isAdmin, 
                    include:[
                        { model: Word, as: "word"
                        }
                    ]
                }
            ]
        });

        return res.status(200).json({ quizzes });
    } catch (error) {
        console.error("Erreur lors de la récupération des quizzes :", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
    }
};

export const updateQuiz = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const error = bodyWithParamsValidator(req.body, quizUpdateSchema, req.params, idParamSchema);
        if (error.length > 0) {
            return res.status(400).json({ error });
        }

        const scope = await getScopeWhere(req);
        if (!scope) {
            return res.status(401).json({ error: { en: "Unauthorized", fr: "Non autorisé", es: "No autorizado", ar: "غير مصرح" } });
        }

        const quiz = await Quiz.findByPk(id, {
            include: [
                {
                    model: UserWord,
                    as: "userWord",
                    where: scope.where,
                    required: !scope.user.isAdmin 
                }
            ]
        });

        if (!quiz) {
            return res.status(404).json({ error: { en: "Quiz not found", fr: "Quiz non trouvé", es: "Quiz no encontrado", ar: "الاختبار غير موجود" } });
        }

        const { areUserAnswersCorrect } = req.body;
        
        console.log("🔍 UpdateQuiz Debug:", {
            quizId: id,
            receivedAnswer: areUserAnswersCorrect,
            currentAnswers: quiz.areUserAnswersCorrect,
            currentAnswersType: typeof quiz.areUserAnswersCorrect
        });
        
        // Initialiser le tableau s'il n'existe pas
        if (!quiz.areUserAnswersCorrect) {
            quiz.areUserAnswersCorrect = [];
            console.log("✅ Initialized empty array for quiz answers");
        }
        
        // Ajouter la nouvelle réponse
        quiz.areUserAnswersCorrect.push(areUserAnswersCorrect);
        
        console.log("🔍 After adding answer:", {
            newAnswers: quiz.areUserAnswersCorrect,
            totalAnswers: quiz.areUserAnswersCorrect.length
        });
        
        const result = await quiz.save();
        
        console.log("✅ Quiz saved successfully:", {
            savedAnswers: result.areUserAnswersCorrect,
            totalSavedAnswers: result.areUserAnswersCorrect?.length || 0
        });
       let userWord = await UserWord.findByPk(quiz.userWordId);
       if(result.correctAnswer.length >= 10){
        if(userWord){
            userWord.isLearned = true;
            await userWord.save();
        }
       }
        return res.status(200).json({ message: { en: "Quiz updated successfully", fr: "Quiz mis à jour avec succès", es: "Quiz actualizado con éxito", ar: "تم تحديث الاختبار بنجاح" }, quiz, userWord });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du quiz :", error);
    res.status(500).json({ error: { en: "Internal server error", fr: "Erreur interne du serveur", es: "Error interno del servidor", ar: "خطأ في الخادم الداخلي" } });
    }
}

        