import Quiz, { QuizAttributes } from "../../models/quiz.model";
import { createUserWordFixture } from "./user-word.fixture";

export const createQuizFixture = async (
  overrides: Partial<{
    userWordId: string;
    correctAnswer: string | boolean[];
    areUserAnswersCorrect: boolean[];
  }> = {}
) => {
  const userWord = overrides.userWordId
    ? { id: overrides.userWordId } as any
    : await createUserWordFixture();

  const correctAnswer =
    typeof overrides.correctAnswer === "string"
      ? overrides.correctAnswer
      : Array.isArray(overrides.correctAnswer)
        ? JSON.stringify(overrides.correctAnswer)
        : "Option 1";

  const quizData: Omit<QuizAttributes, "id" | "createdAt" | "updatedAt"> = {
    userWordId: userWord.id,
    question: "What is the meaning of this word?",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correctAnswer,
    type: "meaning",
    areUserAnswersCorrect: overrides.areUserAnswersCorrect ?? [],
  };

  return Quiz.create(quizData);
};
