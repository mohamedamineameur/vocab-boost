import api from "./main";
import type { UserWordAttributes } from "../../../src/models/user-word.model";

export const createUserWord = async (userWordData: UserWordAttributes) => {
  const response = await api.post(`/user-words/${userWordData.userId}/${userWordData.wordId}`);
  return response.data;
};

export const getUserWords = async () => {
  const response = await api.get("/user-words");
  return response.data;
};

export const getUserWordById = async (id: string) => {
  const response = await api.get(`/user-words/${id}`);
  return response.data;
};