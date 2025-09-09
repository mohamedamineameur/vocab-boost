import { Schema } from "./bodyValidator.ts";

export const categoryCreationSchema: Schema = {
 name: { type: "string", required: true, maxLength: 100, messages: { required: "Name is required" } },
 description: { type: "string", required: true, maxLength: 500, messages: { required: "Description is required" } },
};
