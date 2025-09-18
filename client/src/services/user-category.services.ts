import api from "./main";
import type { UserCategoryAttributes } from "../../../src/models/user-category.model";

export const createUserCategory = async (userCategoryData: UserCategoryAttributes) => {
  const response = await api.post(`/user-categories/${userCategoryData.userId}/${userCategoryData.categoryId}`, userCategoryData);
  return response.data;
};

export const getUserCategories = async () => {
  const response = await api.get("/user-categories");
  return response.data;
};

export const getUserCategoryById = async (id: string) => {
  const response = await api.get(`/user-categories/${id}`);
  return response.data;
};