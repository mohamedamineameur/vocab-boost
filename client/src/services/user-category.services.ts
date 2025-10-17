import api from "./main";

interface UserCategoryAttributes {
  userId: string;
  categoryId: string;
}

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