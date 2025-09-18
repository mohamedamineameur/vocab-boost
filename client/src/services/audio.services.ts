import api from "./main";


export const getAudio = async (text: string) => {
  const response = await api.get("/audio", {
    params: { text },
    responseType: "blob",
  });

  
  return URL.createObjectURL(response.data);
};
