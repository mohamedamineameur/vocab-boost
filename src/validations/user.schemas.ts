import { Schema } from "./bodyValidator.ts";

export const userCreationSchema: Schema = {
    email: { 
        type: "string", 
        required: true, 
        maxLength: 255, 
        regex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, 
        messages: { 
            required: "Email is required", 
            type: "Email must be a valid email address" 
        } 
    },
    password: {
        type: "string",
        required: true,
        minLength: 12,
        regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/,
        messages: {
            required: "Password is required",
            minLength: "Password must be at least 12 characters long",
            regex: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
    },
    passwordConfirmation: {
        type: "string",
        required: true,
        minLength: 12,
        regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/,
        messages: {
            required: "Password confirmation is required",
            minLength: "Password confirmation must be at least 12 characters long",
            regex: "Password confirmation must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
    },
    firstname: { type: "string", required: true, maxLength: 50, messages: { required: "First name is required" } },
    lastname: { type: "string", required: true, maxLength: 50, messages: { required: "Last name is required" } },
};

export const updateUserSchema: Schema = {
  email: { 
    type: "string", 
    required: false, 
    maxLength: 255, 
    regex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, 
    messages: { 
      type: "Email must be a valid email address" 
    } 
  },
  firstname: { type: "string", required: false, maxLength: 50 },
  lastname: { type: "string", required: false, maxLength: 50 },
  password: {
    type: "string",
    required: false,
    dependsOn: "newPassword",
    messages: {
      required: "Password is required when changing password",
    },
  },
  newPassword: {
    type: "string",
    required: false,
    minLength: 12,
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/,
    messages: {
      minLength: "New password must be at least 12 characters long",
      regex: "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    },
  },
  passwordConfirmation: {
    type: "string",
    required: false,
    dependsOn: "newPassword", 
    minLength: 12,
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/,
    messages: {
      required: "Password confirmation is required when changing password",
      minLength: "Password confirmation must be at least 12 characters long",
      regex: "Password confirmation must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    },
  },
};


