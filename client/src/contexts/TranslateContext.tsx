import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type Language = 'fr' | 'en' | 'ar' | 'es';

type TranslationValue = string | { [key: string]: TranslationValue };

type Translations = {
    [key in Language]: { [key: string]: TranslationValue }
};

const translations: Translations = {
    fr: {
        hello: 'Bonjour',
        welcome: 'Bienvenue',
        signup: {
    heroTitle: "Apprends l’anglais en t’amusant",
    heroSubtitle: "Rejoins une communauté motivante et atteins tes objectifs 🎯",
    createAccount: "Créer un compte",
    haveAccount: "Déjà un compte ?",
    login: "Se connecter"
  },
  form: {
    firstname: "Prénom",
    lastname: "Nom",
    email: "Email",
    password: "Mot de passe",
    passwordConfirm: "Confirmer le mot de passe",

    errorBeforeContinue: "⚠️ Veuillez corriger les erreurs avant de continuer.",
    genericError: "Une erreur est survenue",
    success: "✅ Compte créé avec succès !",
    loading: "Création...",
    submit: "S'inscrire",

    emailCheck: "📧 Vérification de l’email",
    emailRule: "Doit être un email valide (ex: nom@domaine.com)",

    passwordCheck: "🔒 Votre mot de passe doit contenir",
    passwordLength: "Au moins 12 caractères",
    passwordUppercase: "Une majuscule",
    passwordNumber: "Un chiffre",
    passwordSpecial: "Un caractère spécial",
    passwordMatch: "Les deux mots de passe doivent correspondre"
  }
    },
    en: {
        hello: 'Hello',
        welcome: 'Welcome',
        signup: {
    heroTitle: "Learn English while having fun",
    heroSubtitle: "Join a motivating community and reach your goals 🎯",
    createAccount: "Create an account",
    haveAccount: "Already have an account?",
    login: "Log in"
  },
  form: {
    firstname: "First name",
    lastname: "Last name",
    email: "Email",
    password: "Password",
    passwordConfirm: "Confirm password",

    errorBeforeContinue: "⚠️ Please fix the errors before continuing.",
    genericError: "An error occurred",
    success: "✅ Account created successfully!",
    loading: "Creating...",
    submit: "Sign up",

    emailCheck: "📧 Email verification",
    emailRule: "Must be a valid email (e.g., name@domain.com)",

    passwordCheck: "🔒 Your password must contain",
    passwordLength: "At least 12 characters",
    passwordUppercase: "An uppercase letter",
    passwordNumber: "A number",
    passwordSpecial: "A special character",
    passwordMatch: "Both passwords must match"
  }
    },
    ar: {
        hello: 'مرحبا',
        welcome: 'أهلا وسهلا',
        signup: {
    heroTitle: "تعلم الإنجليزية وأنت تستمتع",
    heroSubtitle: "انضم إلى مجتمع محفز وحقق أهدافك 🎯",
    createAccount: "إنشاء حساب",
    haveAccount: "هل لديك حساب؟",
    login: "تسجيل الدخول"
  },
  form: {
    firstname: "الاسم الأول",
    lastname: "الاسم الأخير",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    passwordConfirm: "تأكيد كلمة المرور",

    errorBeforeContinue: "⚠️ يرجى تصحيح الأخطاء قبل المتابعة.",
    genericError: "حدث خطأ ما",
    success: "✅ تم إنشاء الحساب بنجاح!",
    loading: "جاري الإنشاء...",
    submit: "إنشاء حساب",

    emailCheck: "📧 التحقق من البريد الإلكتروني",
    emailRule: "يجب أن يكون بريدًا إلكترونيًا صالحًا (مثال: name@domain.com)",

    passwordCheck: "🔒 يجب أن تحتوي كلمة المرور على",
    passwordLength: "12 حرفًا على الأقل",
    passwordUppercase: "حرف كبير واحد",
    passwordNumber: "رقم واحد",
    passwordSpecial: "رمز خاص واحد",
    passwordMatch: "يجب أن تتطابق كلمتا المرور"
  }
    },
    es: {
        hello: 'Hola',
        welcome: 'Bienvenido',
        signup: {
    heroTitle: "Aprende inglés mientras te diviertes",
    heroSubtitle: "Únete a una comunidad motivadora y alcanza tus objetivos 🎯",
    createAccount: "Crear una cuenta",
    haveAccount: "¿Ya tienes una cuenta?",
    login: "Iniciar sesión"
  },
  form: {
    firstname: "Nombre",
    lastname: "Apellido",
    email: "Correo electrónico",
    password: "Contraseña",
    passwordConfirm: "Confirmar contraseña",

    errorBeforeContinue: "⚠️ Corrige los errores antes de continuar.",
    genericError: "Ocurrió un error",
    success: "✅ ¡Cuenta creada con éxito!",
    loading: "Creando...",
    submit: "Registrarse",

    emailCheck: "📧 Verificación del correo electrónico",
    emailRule: "Debe ser un correo válido (ej: nombre@dominio.com)",

    passwordCheck: "🔒 Tu contraseña debe contener",
    passwordLength: "Al menos 12 caracteres",
    passwordUppercase: "Una letra mayúscula",
    passwordNumber: "Un número",
    passwordSpecial: "Un carácter especial",
    passwordMatch: "Las dos contraseñas deben coincidir"
  }
    },
};

interface TranslateContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const TranslateContext = createContext<TranslateContextProps | undefined>(undefined);

export const TranslateProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Vérifie si une langue est déjà sauvegardée
    const saved = localStorage.getItem("lang") as Language | null;
    return saved || "en"; // 👉 fallback par défaut : anglais
  });

  // Sauvegarde à chaque changement
  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  const t = (key: string) => {
    const keys = key.split(".");
    let value: TranslationValue = translations[language];
    for (const k of keys) {
      if (typeof value === "object" && value !== null && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    return typeof value === "string" ? value : key;
  };

  return (
    <TranslateContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslateContext.Provider>
  );
};

export const useTranslate = () => {
    const context = useContext(TranslateContext);
    if (!context) {
        throw new Error('useTranslate must be used within a TranslateProvider');
    }
    return context;
};