import { Request, Response } from "express";
import fetch from "node-fetch";
import FormData from "form-data";
import env from "../config/env";

export const recognizeSpeech = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: { 
          en: "No audio file provided", 
          fr: "Aucun fichier audio fourni", 
          es: "No se proporcionó archivo de audio", 
          ar: "لم يتم توفير ملف صوتي" 
        } 
      });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: "audio.webm",
      contentType: req.file.mimetype,
    });
    formData.append("model", "whisper-1");
    formData.append("language", "en"); // Force English for learning

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.GPT_API_KEY}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI Whisper API error:", errorData);
      return res.status(500).json({ 
        error: { 
          en: "Failed to transcribe audio", 
          fr: "Échec de la transcription audio", 
          es: "Error al transcribir audio", 
          ar: "فشل في نسخ الصوت" 
        } 
      });
    }

    const data = await response.json();
    
    res.status(200).json({
      transcript: (data as { text?: string }).text || "",
    });
  } catch (error) {
    console.error("Error in speech recognition:", error);
    res.status(500).json({ 
      error: { 
        en: "Internal server error", 
        fr: "Erreur interne du serveur", 
        es: "Error interno del servidor", 
        ar: "خطأ في الخادم الداخلي" 
      } 
    });
  }
};

