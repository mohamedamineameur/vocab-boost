import api from "./main";
import type { ProfileAttributes } from "../../../src/models/profile.model";

export const createProfile = async (profileData: ProfileAttributes) => {
  const response = await api.post("/profiles", profileData);
  return response.data;
};

export const getProfiles = async () => {
  const response = await api.get("/profiles");
  return response.data;
};

export const getProfileById = async (id: string) => {
  const response = await api.get(`/profiles/${id}`);
  return response.data;
};

export const updateProfile = async (id: string, profileData: Partial<ProfileAttributes>) => {
  const response = await api.patch(`/profiles/${id}`, profileData);
  return response.data;
};

export const deleteProfile = async (id: string) => {
  const response = await api.delete(`/profiles/${id}`);
  return response.data;
}