import api from "./main";

export const getQuizzes = async () => {
  const response = await api.get("/quizzes");
  return response.data;
};

export const updateQuiz = async (id:string, areUserAnswersCorrect: boolean) => {

    console.log("Updating quiz", id, areUserAnswersCorrect);
  const response = await api.patch(`/quizzes/${id}`, { areUserAnswersCorrect });
  return response.data;
};
