import api from "./main";
import type { WordAttributes } from "../../../src/models/word.model";

export const createWord = async (wordData: WordAttributes) => {
  const response = await api.post("/words", wordData);
  return response.data;
};

export const getWords = async () => {
  const response = await api.get("/words");
  return response.data;
};

export const getWordById = async (id: string) => {
  const response = await api.get(`/words/${id}`);
  return response.data;
}