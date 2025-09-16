import api from "./main";
import type { CategoryCreationAttributes } from "../../../src/models/category.model";

export const createCategory = async (categoryData: CategoryCreationAttributes) => {
  const response = await api.post("/categories", categoryData);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export const getCategoryById = async (id: string) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};