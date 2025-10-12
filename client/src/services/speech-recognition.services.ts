import api from "./main";

export const recognizeSpeech = async (audioBlob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  const response = await api.post("/speech-recognition", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.transcript || "";
};

