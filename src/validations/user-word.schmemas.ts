import { Schema } from "./bodyValidator";

export const userWordSchema: Schema = {
  userId: {
    type: "string",
    required: true,
    regex:
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
    messages: {
      required: "userId parameter is required",
      regex: "userId parameter must be a valid UUID",
    },
  },
  wordId: {
    type: "string",
    required: true,
    regex:
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
    messages: {
      required: "wordId parameter is required",
      regex: "wordId parameter must be a valid UUID",
    },
  },
};
