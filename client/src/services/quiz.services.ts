import api from "./main";

export const getQuizzes = async () => {
  const response = await api.get("/quizzes");
  // getQuizzes response
  return response.data;
};

export const createQuiz = async (quizData: {
  userWordId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  type: string;
  areUserAnswersCorrect: boolean;
}) => {
  const response = await api.post("/quizzes", quizData);
  return response.data;
};

export const updateQuiz = async (id:string, areUserAnswersCorrect: boolean) => {

    // Updating quiz
  const response = await api.patch(`/quizzes/${id}`, { areUserAnswersCorrect });
  return response.data;
};
