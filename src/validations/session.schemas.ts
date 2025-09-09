import { Schema } from "./bodyValidator.ts";

export const sessionCreationSchema: Schema = {
  email: {
    type: "string",
    required: true,
    minLength: 5,
    maxLength: 255,
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      required: "Email is required",
      minLength: "Email must be at least 5 characters long",
      maxLength: "Email must be at most 255 characters long",
      regex: "Email format is invalid",
    },
  },
  password: {
    type: "string",
    required: true,
  },
};