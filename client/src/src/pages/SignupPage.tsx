/* eslint-disable */
import { useState } from "react";
import { createUser } from "../../services/user.services";
import { Mail, Lock, User, CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext"; // 🔑 intégration du contexte

export default function SignupPage() {
  const { t, language } = useTranslate(); // 🔑 accès aux traductions

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Validation
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const passwordRules = {
    length: form.password.length >= 12,
    uppercase: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
    match: !!(form.password && form.password === form.passwordConfirmation),
  };

  const isFormValid = emailValid && Object.values(passwordRules).every(Boolean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isFormValid) {
      setError(t("form.errorBeforeContinue")); // 🔑 traduction
      setLoading(false);
      return;
    }

    try {
      await createUser(form);
      setSuccess(true);
    } catch (err: unknown) {
  let message = t("form.genericError");
  const error = err as { response?: { data?: unknown }; message?: string };

  if (error.response?.data) {
    const data = error.response.data as Record<string, unknown>;
    if (typeof data === "string") {
      message = data;
    } else if (data.message) {
      const msg = data.message as Record<string, string> | string;
      message = typeof msg === "object" ? (msg[language] || msg.en || JSON.stringify(msg)) : msg;
    } else if (data.error) {
      const err = data.error as Record<string, string> | string;
      message = typeof err === "object" ? (err[language] || err.en || JSON.stringify(err)) : err;
    } else if (Array.isArray(data.errors)) {
      message = (data.errors as string[]).join(", ");
    }
  } else if (error.message) {
    message = error.message;
  }

  setError(message);
}
 finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#3B82F6] via-[#60A5FA] to-[#22C55E] px-4">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
          🚀 {t("signup.heroTitle")}
        </h1>
        <p className="text-white/90 mt-2 text-lg">{t("signup.heroSubtitle")}</p>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/40">
        <h2 className="text-2xl font-bold text-[#111827] text-center mb-6">
          {t("signup.createAccount")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Prénom */}
          <InputField
            icon={<User size={20} className="text-gray-400" />}
            name="firstname"
            value={form.firstname}
            onChange={handleChange}
            label={t("form.firstname")}
            valid={!!form.firstname}
          />

          {/* Nom */}
          <InputField
            icon={<User size={20} className="text-gray-400" />}
            name="lastname"
            value={form.lastname}
            onChange={handleChange}
            label={t("form.lastname")}
            valid={!!form.lastname}
          />

          {/* Email */}
          <InputField
            icon={<Mail size={20} className="text-gray-400" />}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            label={t("form.email")}
            valid={emailValid}
          />

          {/* Password */}
          <PasswordField
            name="password"
            value={form.password}
            onChange={handleChange}
            label={t("form.password")}
            show={showPassword}
            toggle={() => setShowPassword(!showPassword)}
            valid={passwordRules.length && passwordRules.uppercase && passwordRules.number && passwordRules.special}
          />

          {/* Confirm Password */}
          <PasswordField
            name="passwordConfirmation"
            value={form.passwordConfirmation}
            onChange={handleChange}
            label={t("form.passwordConfirm")}
            show={showPasswordConfirm}
            toggle={() => setShowPasswordConfirm(!showPasswordConfirm)}
            valid={!!passwordRules.match}
          />

          {/* Helpers */}
          <EmailHelper emailValid={emailValid} t={t} />
          <PasswordHelper rules={passwordRules} t={t} />

          {/* Messages */}
          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={t("form.success")} />}

          {/* Bouton */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full py-3 px-6 rounded-2xl font-semibold text-white shadow-lg bg-gradient-to-r from-[#3B82F6] to-[#22C55E] hover:opacity-90 active:scale-95 transition transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {t("form.loading")}
              </>
            ) : (
              t("form.submit")
            )}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-6">
          {t("signup.haveAccount")}{" "}
          <a href="/login" className="text-[#3B82F6] font-semibold hover:underline">
            {t("signup.login")}
          </a>
        </p>
      </div>
    </div>
  );
}

/* ----------- Composants réutilisables ----------- */
interface InputFieldProps {
  icon: React.ReactNode;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  valid: boolean;
  type?: string;
}
function InputField({ icon, name, value, onChange, label, valid, type = "text" }: InputFieldProps) {
  const getClasses = (valid: boolean) =>
    `peer w-full pl-10 pr-12 pt-5 pb-2 border rounded-2xl text-[#111827] bg-white/60 focus:bg-white transition-all outline-none ${
      valid ? "border-gray-300 focus:ring-2 focus:ring-[#3B82F6]" : "border-red-500 focus:ring-2 focus:ring-red-500"
    }`;
  return (
    <div className="relative group">
      <span className="absolute left-3 top-3">{icon}</span>
      <input
        type={type}
        name={name}
        placeholder=" "
        value={value}
        onChange={onChange}
        required
        className={getClasses(valid)}
      />
      <label className="absolute left-10 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#3B82F6]">
        {label}
      </label>
    </div>
  );
}

interface PasswordFieldProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  valid: boolean;
  show: boolean;
  toggle: () => void;
}
function PasswordField({ name, value, onChange, label, valid, show, toggle }: PasswordFieldProps) {
  return (
    <div className="relative group">
      <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder=" "
        value={value}
        onChange={onChange}
        required
        className={`peer w-full pl-10 pr-12 pt-5 pb-2 border rounded-2xl text-[#111827] bg-white/60 focus:bg-white transition-all outline-none ${
          valid ? "border-gray-300 focus:ring-2 focus:ring-[#3B82F6]" : "border-red-500 focus:ring-2 focus:ring-red-500"
        }`}
      />
      <label className="absolute left-10 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#3B82F6]">
        {label}
      </label>
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-3 text-gray-400 hover:text-[#111827] transition"
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}

function Alert({ type, message }: { type: "error" | "success"; message: string }) {
  const colors =
    type === "error"
      ? "bg-red-100 text-red-600"
      : "bg-green-100 text-green-600";
  return (
    <div className={`${colors} text-sm font-medium px-4 py-2 rounded-xl text-center shadow`}>
      {message}
    </div>
  );
}

interface EmailHelperProps {
  emailValid: boolean;
  t: (key: string) => string;
}
function EmailHelper({ emailValid, t }: EmailHelperProps) {
  return (
    <div className="space-y-1 text-sm">
      <p className="font-medium text-[#111827]">{t("form.emailCheck")} :</p>
      <div className="flex items-center gap-2">
        {emailValid ? (
          <CheckCircle size={16} className="text-[#22C55E]" />
        ) : (
          <XCircle size={16} className="text-red-500" />
        )}
        <span className={emailValid ? "text-[#22C55E]" : "text-red-500"}>
          {t("form.emailRule")}
        </span>
      </div>
    </div>
  );
}

interface PasswordHelperProps {
  rules: {
    length: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
    match: boolean;
  };
  t: (key: string) => string;
}
function PasswordHelper({ rules, t }: PasswordHelperProps) {
  const helpers = [
    { key: "length", label: t("form.passwordLength") },
    { key: "uppercase", label: t("form.passwordUppercase") },
    { key: "number", label: t("form.passwordNumber") },
    { key: "special", label: t("form.passwordSpecial") },
    { key: "match", label: t("form.passwordMatch") },
  ];
  return (
    <div className="space-y-1 text-sm">
      <p className="font-medium text-[#111827]">{t("form.passwordCheck")} :</p>
      {helpers.map(({ key, label }) => {
        const valid = rules[key as keyof typeof rules];
        const Icon = valid ? CheckCircle : XCircle;
        return (
          <div key={key} className="flex items-center gap-2">
            <Icon size={16} className={valid ? "text-[#22C55E]" : "text-red-500"} />
            <span className={valid ? "text-[#22C55E]" : "text-red-500"}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
