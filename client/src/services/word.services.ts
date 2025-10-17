import api from "./main";

interface WordAttributes {
  text: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  categoryId: string;
  frTranslation?: string;
  esTranslation?: string;
  arTranslation?: string;
}

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