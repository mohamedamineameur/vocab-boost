// src/utils/emailService.ts
import transporter from "../config/nodemailer";
import env from "../config/env";

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Envoie un email générique
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const { to, subject, html, text } = options;

  const mailOptions = {
    from: `"English Learning App" <${env.EMAIL_FROM}
>`,
    to,
    subject,
    html,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé:", info.messageId);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);
    throw new Error("Échec de l'envoi de l'email");
  }
};

/**
 * Envoie un email de vérification
 */
export const sendVerificationEmail = async (
  email: string,
  verificationToken: string,
  userId: string
): Promise<void> => {
  const verificationLink = `${env.DOMAIN || "http://localhost:5173"}/verify/${userId}/${verificationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Bienvenue sur English Learning App! 🎉</h2>
      <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
      <a href="${verificationLink}" 
         style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 8px; margin: 20px 0;">
        Vérifier mon compte
      </a>
      <p>Ou copiez ce lien dans votre navigateur :</p>
      <p style="color: #666; word-break: break-all;">${verificationLink}</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Si vous n'avez pas créé ce compte, vous pouvez ignorer cet email.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Vérifiez votre compte - English Learning App",
    html,
    text: `Bienvenue! Veuillez vérifier votre compte en cliquant sur ce lien : ${verificationLink}`,
  });
};

/**
 * Envoie un email de bienvenue après vérification
 */
export const sendWelcomeEmail = async (
  email: string,
  firstname: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #22C55E;">Bienvenue ${firstname}! 🎊</h2>
      <p>Votre compte a été vérifié avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités :</p>
      <ul style="line-height: 2;">
        <li>📚 Apprendre du vocabulaire anglais</li>
        <li>🎯 Passer des quiz interactifs</li>
        <li>🏆 Débloquer des achievements</li>
        <li>📊 Suivre vos progrès</li>
      </ul>
      <a href="${env.DOMAIN || "http://localhost:3000"}/login" 
         style="display: inline-block; background-color: #22C55E; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 8px; margin: 20px 0;">
        Commencer à apprendre
      </a>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Bonne chance dans votre apprentissage! 🚀
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Bienvenue sur English Learning App! 🎉",
    html,
    text: `Bienvenue ${firstname}! Votre compte est maintenant actif. Connectez-vous pour commencer : ${env.DOMAIN || "http://localhost:3000"}/login`,
  });
};

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  userId: string,
  firstname: string
): Promise<void> => {
  const resetLink = `${env.DOMAIN || "http://localhost:5173"}/reset-password/${userId}/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #EF4444;">Réinitialisation de votre mot de passe 🔐</h2>
      <p>Bonjour ${firstname},</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
      <a href="${resetLink}" 
         style="display: inline-block; background-color: #EF4444; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 8px; margin: 20px 0;">
        Réinitialiser mon mot de passe
      </a>
      <p style="color: #666; font-size: 14px;">
        <strong>⚠️ Important :</strong> Ce lien expire dans 1 heure pour votre sécurité.
      </p>
      <p style="color: #666; font-size: 14px;">
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        L'équipe English Learning App
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe 🔐",
    html,
    text: `Bonjour ${firstname}, cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`,
  });
};

/**
 * Envoie un code MFA par email
 */
export const sendMFACode = async (
  email: string,
  code: string,
  firstname: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Code de vérification 🔐</h2>
      <p>Bonjour ${firstname},</p>
      <p>Voici votre code de vérification pour vous connecter :</p>
      <div style="background-color: #F3F4F6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #3B82F6; font-size: 36px; letter-spacing: 8px; margin: 0;">
          ${code}
        </h1>
      </div>
      <p style="color: #666; font-size: 14px;">
        <strong>⚠️ Important :</strong> Ce code expire dans 10 minutes pour votre sécurité.
      </p>
      <p style="color: #666; font-size: 14px;">
        Si vous n'avez pas essayé de vous connecter, ignorez cet email et changez votre mot de passe.
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        L'équipe English Learning App
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Code de vérification - English Learning App 🔐",
    html,
    text: `Bonjour ${firstname}, votre code de vérification est : ${code}. Ce code expire dans 10 minutes.`,
  });
};

