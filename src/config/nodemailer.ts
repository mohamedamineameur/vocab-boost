// src/config/nodemailer.ts
import nodemailer from "nodemailer";
import env from "./env";

// Configuration du transporteur Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.MAIL_EMAIL,
    pass: env.MAIL_PASS, // Mot de passe d'application Gmail
  },
});

// Vérifier la connexion au démarrage (optionnel)
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erreur de configuration email:", error);
  } else {
    console.log("✅ Serveur email prêt à envoyer des messages");
  }
});

export default transporter;

