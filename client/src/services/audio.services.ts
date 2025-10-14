import api from "./main";

export const getAudio = async (text: string) => {
  try {
    const response = await api.get("/audio", {
      params: { text },
      responseType: "blob",
    });

    if (!response.data || response.data.size === 0) {
      throw new Error("Audio data is empty");
    }

    // Créer un blob URL avec le bon type MIME
    const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
    const blobUrl = URL.createObjectURL(audioBlob);
    
    return blobUrl;
    
  } catch (error) {
    throw error;
  }
};
