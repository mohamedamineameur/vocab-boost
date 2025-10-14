import api from "./main";

export const getQuizzes = async () => {
  const response = await api.get("/quizzes");
  // getQuizzes response
  return response.data;
};

export const updateQuiz = async (id:string, areUserAnswersCorrect: boolean) => {

    // Updating quiz
  const response = await api.patch(`/quizzes/${id}`, { areUserAnswersCorrect });
  return response.data;
};
