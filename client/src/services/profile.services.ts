import api from "./main";

interface ProfileAttributes {
  userId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  nativeLanguage?: string;
  targetLanguage?: string;
  theme?: 'light' | 'dark';
}

export const createProfile = async (profileData: ProfileAttributes) => {
  const response = await api.post("/profiles", profileData);
  return response.data;
};

export const getProfiles = async () => {
  const response = await api.get("/profiles");
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/profiles/me");
  return response.data;
};

export const getProfileById = async (id: string) => {
  const response = await api.get(`/profiles/${id}`);
  return response.data;
};

export const updateProfile = async (profileData: Partial<ProfileAttributes>) => {
  const response = await api.patch("/profiles/me", profileData);
  return response.data;
};

export const deleteProfile = async (id: string) => {
  const response = await api.delete(`/profiles/${id}`);
  return response.data;
}