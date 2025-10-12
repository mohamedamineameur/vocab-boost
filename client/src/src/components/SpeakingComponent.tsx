import { useState, useRef } from "react";
import { Mic, MicOff, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { recognizeSpeech } from "../../services/speech-recognition.services";

interface SpeakingComponentProps {
  questionId: string;
  textToSpeak: string; // Le texte que l'utilisateur doit prononcer
  correctAnswer: string;
  fetchAnswer: (id: string, isCorrect: boolean) => Promise<unknown>;
}

const tr = {
  fr: {
    speakWord: "Prononcez le mot suivant :",
    startRecording: "Commencer l'enregistrement",
    stopRecording: "Arrêter l'enregistrement",
    recording: "Enregistrement en cours...",
    processing: "Traitement en cours...",
    check: "Vérifier",
    tryAgain: "Réessayer",
    correct: "Excellent !",
    incorrect: "Réessayez. Le mot attendu était :",
    youSaid: "Vous avez dit :",
    noSpeech: "Aucune parole détectée. Réessayez.",
    notSupported: "L'enregistrement audio n'est pas supporté par votre navigateur.",
    clickToSpeak: "Cliquez sur le microphone et prononcez le mot",
    recordingError: "Erreur lors de l'enregistrement",
  },
  en: {
    speakWord: "Say the following word:",
    startRecording: "Start recording",
    stopRecording: "Stop recording",
    recording: "Recording...",
    processing: "Processing...",
    check: "Check",
    tryAgain: "Try again",
    correct: "Excellent!",
    incorrect: "Try again. The expected word was:",
    youSaid: "You said:",
    noSpeech: "No speech detected. Try again.",
    notSupported: "Audio recording is not supported by your browser.",
    clickToSpeak: "Click the microphone and say the word",
    recordingError: "Recording error",
  },
  ar: {
    speakWord: "انطق الكلمة التالية:",
    startRecording: "ابدأ التسجيل",
    stopRecording: "أوقف التسجيل",
    recording: "جارٍ التسجيل...",
    processing: "جارٍ المعالجة...",
    check: "تحقق",
    tryAgain: "حاول مرة أخرى",
    correct: "ممتاز!",
    incorrect: "حاول مرة أخرى. الكلمة المتوقعة كانت:",
    youSaid: "قلت:",
    noSpeech: "لم يتم اكتشاف أي كلام. حاول مرة أخرى.",
    notSupported: "تسجيل الصوت غير مدعوم من متصفحك.",
    clickToSpeak: "انقر على الميكروفون وانطق الكلمة",
    recordingError: "خطأ في التسجيل",
  },
  es: {
    speakWord: "Di la siguiente palabra:",
    startRecording: "Iniciar grabación",
    stopRecording: "Detener grabación",
    recording: "Grabando...",
    processing: "Procesando...",
    check: "Verificar",
    tryAgain: "Intentar de nuevo",
    correct: "¡Excelente!",
    incorrect: "Intenta de nuevo. La palabra esperada era:",
    youSaid: "Dijiste:",
    noSpeech: "No se detectó voz. Intenta de nuevo.",
    notSupported: "La grabación de audio no es compatible con tu navegador.",
    clickToSpeak: "Haz clic en el micrófono y di la palabra",
    recordingError: "Error de grabación",
  },
} as const;

export default function SpeakingComponent({
  questionId,
  textToSpeak,
  correctAnswer,
  fetchAnswer,
}: SpeakingComponentProps) {
  const { language } = useTranslate();
  const t = (key: keyof typeof tr["fr"]) =>
    (tr as Record<string, Record<string, string>>)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  const startRecording = async () => {
    setError("");
    setTranscript("");
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        // Arrêter tous les tracks du stream
        stream.getTracks().forEach(track => track.stop());
        
        // Envoyer l'audio à l'API pour la reconnaissance
        setIsProcessing(true);
        try {
          const recognizedText = await recognizeSpeech(audioBlob);
          setTranscript(recognizedText);
          if (!recognizedText.trim()) {
            setError(t("noSpeech"));
          }
        } catch (err) {
          console.error("Error recognizing speech:", err);
          setError(t("recordingError"));
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError(t("recordingError"));
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCheck = async () => {
    if (!transcript.trim()) return;

    // Normaliser pour la comparaison
    const normalize = (s: string) => s.toLowerCase().trim().replace(/[^\w\s]/g, "");
    const correct = normalize(transcript) === normalize(correctAnswer);

    setIsCorrect(correct);
    setSubmitted(true);

    await fetchAnswer(questionId, correct);
  };

  const handleReset = () => {
    setTranscript("");
    setSubmitted(false);
    setIsCorrect(null);
    setError("");
  };

  if (!isSupported) {
    return (
      <div className="p-6 rounded-2xl bg-yellow-100 text-yellow-800 border border-yellow-200 flex items-start gap-3" dir={isRTL ? "rtl" : "ltr"}>
        <AlertCircle className="w-6 h-6 shrink-0 mt-1" />
        <div>
          <p className="font-semibold mb-1">{t("notSupported")}</p>
          <p className="text-sm">
            Veuillez utiliser un navigateur moderne avec support de l'enregistrement audio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center">
        <p className="text-sm text-[#111827]/70 mb-2">{t("speakWord")}</p>
        <h3 className="text-3xl font-bold text-[#3B82F6] mb-1">
          {textToSpeak}
        </h3>
        <p className="text-xs text-[#111827]/50 mt-2">{t("clickToSpeak")}</p>
      </div>

      {!submitted && (
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={[
              "w-24 h-24 rounded-full shadow-2xl transition-all flex items-center justify-center",
              isProcessing
                ? "bg-gray-400 text-white cursor-not-allowed"
                : isRecording
                ? "bg-red-500 text-white animate-pulse scale-110"
                : "bg-[#3B82F6] text-white hover:scale-105 active:scale-95",
            ].join(" ")}
          >
            {isProcessing ? (
              <Loader2 className="w-12 h-12 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-12 h-12" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
          </button>

          <p className="text-sm font-medium text-[#111827]">
            {isProcessing 
              ? t("processing") 
              : isRecording 
              ? t("recording") 
              : t("startRecording")
            }
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-yellow-100 text-yellow-800 border border-yellow-200 text-center">
          {error}
        </div>
      )}

      {transcript && !submitted && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[#F3F4F6] border border-[#F3F4F6]">
            <p className="text-xs text-[#111827]/70 mb-1">{t("youSaid")}</p>
            <p className="text-xl font-semibold text-[#111827]">{transcript}</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 px-6 rounded-2xl shadow-md bg-white border border-[#F3F4F6] text-[#111827] hover:scale-105 active:scale-95 transition"
            >
              {t("tryAgain")}
            </button>
            <button
              type="button"
              onClick={handleCheck}
              className="flex-1 py-3 px-6 rounded-2xl shadow-md bg-[#22C55E] text-white hover:scale-105 active:scale-95 transition"
            >
              {t("check")}
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="space-y-4">
          {isCorrect ? (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-100 text-green-700 border border-green-200">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-semibold">{t("correct")}</p>
                <p className="text-sm mt-1">{t("youSaid")} <strong>{transcript}</strong></p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 p-4 rounded-2xl bg-red-100 text-red-700 border border-red-200">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 shrink-0" />
                <span className="font-semibold">{t("incorrect")}</span>
              </div>
              <div className="text-sm mt-2">
                <p>{t("youSaid")} <strong>{transcript}</strong></p>
                <p className="mt-1 text-[#111827]">
                  <strong>{correctAnswer}</strong>
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="w-full py-3 px-6 rounded-2xl shadow-md bg-[#3B82F6] text-white hover:scale-105 active:scale-95 transition"
          >
            {t("tryAgain")}
          </button>
        </div>
      )}
    </div>
  );
}
