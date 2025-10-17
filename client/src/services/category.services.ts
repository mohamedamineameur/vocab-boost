import api from "./main";

interface CategoryCreationAttributes {
  name: string;
  description?: string;
}

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