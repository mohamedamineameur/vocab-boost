import api from "./main";
import type { UserCreationAttributes } from "../../..//src/models/user.model";

export const createUser = async (userData: UserCreationAttributes) => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await api.post("/sessions", { email, password });
  return response.data;
}
