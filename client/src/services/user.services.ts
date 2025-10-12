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

export const me = async()=>{
    const response = await api.get("/sessions/me");
  return response.data;

}

export const destroySession= async()=>{
    const response = await api.delete("/sessions");
    return response.data;
}

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, userData: Partial<UserCreationAttributes>) => {
  const response = await api.patch(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const resendVerificationEmail = async (email: string) => {
  const response = await api.post("/users/resend-verification", { email });
  return response.data;
};

export const requestPasswordReset = async (email: string) => {
  const response = await api.post("/users/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (userId: string, resetToken: string, password: string, passwordConfirmation: string) => {
  const response = await api.post(`/users/reset-password/${userId}/${resetToken}`, { 
    password, 
    passwordConfirmation 
  });
  return response.data;
};
