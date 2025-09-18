import { Router } from "express";
import fetch from "node-fetch";
import env from "../config/env";

const audioRouter = Router();

audioRouter.get("/", (async (req, res) => {
    const text = req.query.text as string;
    if (!text) {
        return res.status(400).json({ error: "Missing 'text' query parameter" });
    }

    const ttsApiKey = env.GPT_API_KEY;
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ttsApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text,
    }),
  });
    if (!response.ok) {
        return res.status(500).json({ error: "Failed to fetch audio from TTS API" });
    }

    const arrayBuffer = await response.arrayBuffer();
  res.setHeader("Content-Type", "audio/mpeg");
  res.send(Buffer.from(arrayBuffer));
}));

export default audioRouter;