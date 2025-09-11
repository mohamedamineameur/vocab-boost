import { getQuizzes, updateQuiz } from "../controllers/quiz.controller";
import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.ts";

const quizRouter = Router();

quizRouter.get("/", isAuthenticated(), getQuizzes);
quizRouter.patch("/:id", isAuthenticated(), updateQuiz);

export default quizRouter;