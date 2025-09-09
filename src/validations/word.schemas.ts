import { Schema } from "./bodyValidator.ts";
export const wordCreationSchema: Schema = {
    text: { type: "string", required: true, maxLength: 100, messages: { required: "Text is required" } },
    meaning: { type: "string", required: true, messages: { required: "Meaning is required" } },
    example: { type: "string", required: true, messages: { required: "Example is required" } },
    categoryId: {
        type: "string",
        required: true,
        regex: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        messages: { regex: "Category ID is required and must be a valid UUID v4" }
    },
    pronunciation: { type: "string", required: true, messages: { required: "Pronunciation is required" } },
    frTranslation: { type: "string", required: true, messages: { required: "French translation is required" } },
    esTranslation: { type: "string", required: true, messages: { required: "Spanish translation is required" } },
    arTranslation: { type: "string", required: true, messages: { required: "Arabic translation is required" } },
    level: { type: "string", required: true, enum: ['beginnerLevelOne', 'beginnerLevelTwo', 'intermediateLevelOne', 'intermediateLevelTwo', 'advancedLevelOne', 'advancedLevelTwo'] },
    synonyms: { type: "array", required: false,  messages: { required: "Synonyms are required" } },
    antonyms: { type: "array", required: false,  messages: { required: "Antonyms are required" } },
    lexicalField: { type: "array", required: false,  messages: { required: "Lexical field is required" } },

};