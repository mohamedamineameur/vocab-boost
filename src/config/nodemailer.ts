// src/config/nodemailer.ts
import nodemailer from "nodemailer";
import env from "./env";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // TLS automatique// true si tu utilises le port 465
  auth: {
    user: env.MAIL_EMAIL,
    pass: env.MAIL_PASS,
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

