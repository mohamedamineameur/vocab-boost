import { Schema } from "./bodyValidator.ts";

export const profileCreationSchema: Schema = {
  userId: { type: "string", required: true },
  local: { type: "string", required: false, enum: ['en', 'fr', 'es', 'ar'] },
  theme: { type: "string", required: false, enum: ['light', 'dark'] },
};
export const updateProfileSchema: Schema = {
  local: { type: "string", required: false, enum: ['en', 'fr', 'es', 'ar'] },
  theme: { type: "string", required: false, enum: ['light', 'dark'] },
};
