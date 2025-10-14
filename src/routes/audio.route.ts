import { Router } from "express";
import fetch from "node-fetch";
import env from "../config/env";

const audioRouter = Router();

audioRouter.get("/", async (req, res) => {
    try {
        const text = req.query.text as string;
        console.log("🎵 Demande TTS pour:", text);
        
        if (!text) {
            return res.status(400).json({ error: "Missing 'text' query parameter" });
        }

        const ttsApiKey = env.GPT_API_KEY;
        if (!ttsApiKey) {
            console.error("🚨 GPT_API_KEY manquante");
            return res.status(500).json({ error: "TTS API key not configured" });
        }

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

        console.log("🎵 Réponse TTS:", {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("🚨 Erreur TTS API:", errorText);
            return res.status(500).json({ 
                error: "Failed to fetch audio from TTS API",
                details: errorText
            });
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);
        
        console.log("🎵 Audio généré:", {
            size: audioBuffer.length,
            type: response.headers.get('content-type'),
            firstBytes: audioBuffer.slice(0, 10).toString('hex')
        });

        // Headers pour le streaming audio avec CORS complet
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Length", audioBuffer.length);
        res.setHeader("Cache-Control", "public, max-age=3600"); // Cache 1h
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Access-Control-Allow-Origin", "*"); // CORS pour les blobs
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        
        res.send(audioBuffer);
    } catch (error) {
        console.error("🚨 Erreur dans audio route:", error);
        res.status(500).json({ 
            error: "Internal server error",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

export default audioRouter;