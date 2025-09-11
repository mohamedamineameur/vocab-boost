import { Schema } from "./bodyValidator.ts";

export const idParamSchema: Schema = {
  id: {
    type: "string",
    required: true,
    regex:
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
    messages: {
      required: "ID parameter is required",
      regex: "ID parameter must be a valid UUID",
    },
  },
};
