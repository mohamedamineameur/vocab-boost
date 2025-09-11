import { Schema } from "./bodyValidator";

export const quizUpdateSchema: Schema = {
    areUserAnswersCorrect: { type:"boolean", required: true, messages: { required: "areUserAnswersCorrect is required", type: "areUserAnswersCorrect must be a boolean" } }
};