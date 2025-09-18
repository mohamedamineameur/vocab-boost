// services/generate-quizzes.service.ts
import axios from "axios";
import { Request } from "express";
import env from "../config/env";
import { Quiz, QuizAttributes } from "../models/quiz.model.ts";
import { Profile } from "../models/profile.model.ts";
import { getScopeWhere } from "../middlewares/getScope.ts";
import { Word } from "../models/word.model.ts";
import { UserWord } from "../models/user-word.model.ts";

const gptApiKey = env.GPT_API_KEY;
const gptApiUrl = "https://api.openai.com/v1/chat/completions";
const gptModel = "gpt-3.5-turbo"; 

type QuizType =
  | "translationEnglishToOther"
  | "translationOtherToEnglish"
  | "meaning"
  | "audio"
  | "wordSorting"
  | "spelling"
  | "speaking";

const QUIZ_TYPES: QuizType[] = [
  "translationEnglishToOther",
  "translationOtherToEnglish",
  "meaning",
  "audio",
  "wordSorting",
  "spelling",
  "speaking",
];

// --- Helpers ---------------------------------------------------------------

/**
 * Essaie d’extraire une chaîne "mot" exploitable depuis le modèle Word,
 * même si le schéma varie (english, en, text, word, value, name, ...).
 */
function getWordStrings(word: any, userLocale: string) {
  const englishCandidate =
    word?.english ??
    word?.en ??
    word?.word ??
    word?.text ??
    word?.value ??
    word?.name ??
    "";

  const localizedCandidate =
    word?.[userLocale] ??
    word?.translation ??
    word?.meaningForLocale ??
    word?.local ??
    null;

  const english = String(englishCandidate || "").trim();
  const localized = localizedCandidate ? String(localizedCandidate).trim() : null;

  // Fallback: si rien d’anglais, prends ce qu’on a
  const base = english || localized || "";
  return { english, localized, base };
}

/** Construit le message utilisateur pour chaque type de quiz. */
function buildPrompt(
  type: QuizType,
  baseWord: string,
  userLocale: string,
  wordTranslation?: string
): { system: string; user: string } {
  const commonSystem =
    "You are a precise language tutor. Always return STRICT JSON that can be parsed with JSON.parse, with keys: question (string), options (array of strings if applicable), correctAnswer (string). Do not include explanations.";
  switch (type) {
    case "translationEnglishToOther":
      return {
        system: commonSystem,
        user: `
Create a multiple-choice question to translate the English word "${baseWord}" into the user's locale language (${userLocale}).
Return JSON with:
- question: a clear instruction in ${userLocale}.
- options: exactly 4 unique plausible translations written in ${userLocale}.
- correctAnswer: the single correct translation (must be one of options).
`.trim(),
      };
    case "translationOtherToEnglish":
      return {
        system: commonSystem,
        user: `
Create a multiple-choice question to translate the word "${baseWord}" from ${userLocale} to English.
Return JSON with:
- question: instruction in English.
- options: exactly 4 unique plausible English translations/synonyms.
- correctAnswer: the single correct English translation (must be one of options).
`.trim(),
      };
    case "meaning":
      return {
        system: commonSystem,
        user: `
Create a multiple-choice "meaning" question for the English word "${baseWord}".
Return JSON with:
- question: instruction in English like "Choose the correct meaning".
- options: exactly 4 concise English definitions/meanings.
- correctAnswer: the single best concise definition from options.
`.trim(),
      };
    case "audio":
      // Comme translationOtherToEnglish
      return {
        system: commonSystem,
        user: `
Create a multiple-choice question as if for an audio exercise: user hears "${baseWord}" in English and must choose the correct word.
Translate the word "${baseWord}" into ${userLocale} .
Return JSON with:
- question: instruction in ${userLocale} (choose the correct translation of the word "${wordTranslation}" ).
- options: exactly 4 English choices.
- correctAnswer: the correct English word (must be one of options).
`.trim(),
      };
    case "wordSorting":
      return {
        system: commonSystem,
        user: `
Create a word-order exercise (sentence unscramble) for the headword "${baseWord}".
Return JSON with:
- question: instruction in English like "Put the words in the correct order".
- options: exactly 2 strings:
   1) a grammatically correct sentence that includes "${baseWord}" (label it not, just return the string),
   2) a scrambled version of the same sentence (words out of order).
- correctAnswer: the correct (well-ordered) sentence (must match options[0] or options[1] whichever is correct).
`.trim(),
      };
    default:
      // Ne sera pas utilisé pour spelling/speaking (pas d’appel API)
      return { system: commonSystem, user: "" };
  }
}

/** Appel OpenAI Chat Completions, renvoie {question, options?, correctAnswer}. */
async function callOpenAIForQuiz(
  type: QuizType,
  baseWord: string,
  userLocale: string,
  wordTranslation?: string
): Promise<{ question: string; options?: string[]; correctAnswer: string }> {
  const { system, user } = buildPrompt(type, baseWord, userLocale, wordTranslation);

  const res = await axios.post(
    gptApiUrl,
    {
      model: gptModel,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${gptApiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30_000,
    }
  );

  const raw = res.data?.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error("Empty response from OpenAI");

  // Essaye de parser le JSON strict ; sinon tente d’extraire le bloc JSON.
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}$/);
    parsed = match ? JSON.parse(match[0]) : null;
  }
  if (!parsed || !parsed.question || !parsed.correctAnswer) {
    throw new Error("Invalid JSON from OpenAI");
  }
  if (parsed.options && !Array.isArray(parsed.options)) {
    throw new Error("Invalid options format from OpenAI");
  }
  return {
    question: String(parsed.question),
    options: parsed.options ? parsed.options.map((s: any) => String(s)) : undefined,
    correctAnswer: String(parsed.correctAnswer),
  };
}

// --- Service principal -----------------------------------------------------

export async function generateQuizs(userWordId: string, req:any) {
  const createdQuizzes: Quiz[] = [];

  try {
    const userWord = await UserWord.findByPk(userWordId);
    if (!userWord) throw new Error("UserWord not found");

    const word = await Word.findByPk((userWord as any).wordId);
    if (!word) throw new Error("Word not found");

    const scope = await getScopeWhere(req);
    if (!scope) throw new Error("Unauthorized");

    const profile = await Profile.findOne({ where: { userId: scope.user.id } });
    if (!profile) throw new Error("Profile not found");

    const userLocale = (profile as any).local || "en";
    const { english, base } = getWordStrings(word, userLocale);
    if (!base) throw new Error("Could not resolve base word string from Word model");
    let wordTranslation 
    if(userLocale === "fr" ){
      wordTranslation = word?.frTranslation
    }
    if(userLocale === "es" ){
      wordTranslation = word?.esTranslation
    }
    if(userLocale === "ar" ){
      wordTranslation = word?.arTranslation
    }

    // On boucle sur chaque type ; un appel API *distinct* pour ceux qui en ont besoin
    for (const type of QUIZ_TYPES) {
      try {
        if (type === "spelling" || type === "speaking") {
          // Pas d'appel API – on met juste le mot DB dans correctAnswer
          const question =
            type === "spelling"
              ? `Spelling: type the correct spelling.`
              : `Speaking: say the word aloud.`;
          const correctAnswer = english || base; 
          const quiz = await Quiz.create({
            userWordId,
            type,
            question,
            correctAnswer,
            options: undefined,
          } as QuizAttributes);
          createdQuizzes.push(quiz);
          continue;
        }

        // Types avec appel API (un appel par type)
        const payload = await callOpenAIForQuiz(type, base, userLocale, wordTranslation);

        // Normalisation minimale : coupe les options vides et dédoublonne
        const options =
          payload.options
            ?.map((s) => s.trim())
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i) ?? null;

        const quiz = await Quiz.create({
          userWordId,
          type,
          question: payload.question.trim(),
          options,
          correctAnswer: payload.correctAnswer.trim(),
        } as QuizAttributes);

        createdQuizzes.push(quiz);
      } catch (innerErr) {
        // On continue pour les autres types tout en loggant l’erreur
        console.error(`[generateQuizs] Failed for type ${type}:`, innerErr);
      }
    }

    return createdQuizzes;
  } catch (err) {
    console.error("[generateQuizs] Fatal error:", err);
    throw err;
  }
}
