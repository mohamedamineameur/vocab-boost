// src/config/env.ts
import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  JWT_SECRET: string;
  SALT_ROUNDS: number;
  SESSION_EXPIRATION: string | number;
  DOMAIN?: string;
  DB_DIALECT: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  GPT_API_KEY?: string;
}

const getEnv = (): EnvConfig => {
  const NODE_ENV = (process.env.NODE_ENV as "development" | "production" | "test") || "development";

  // Sélection automatique de la bonne DB
  let DB_NAME = process.env.DB_NAME || "fullstack_dev";
  if (NODE_ENV === "test") {
    DB_NAME = process.env.DB_NAME_TEST || "fullstack_test";
  }
  if (NODE_ENV === "production") {
    DB_NAME = process.env.DB_NAME_PROD || "fullstack_prod";
  }

  return {
    NODE_ENV,
    PORT: Number(process.env.PORT) || 3000,
    JWT_SECRET: process.env.JWT_SECRET || "default_secret",
    SALT_ROUNDS: Number(process.env.SALT_ROUNDS) || 10,
    SESSION_EXPIRATION: process.env.SESSION_EXPIRATION || "1h",
    DOMAIN: process.env.DOMAIN || undefined,

    DB_DIALECT: process.env.DB_DIALECT || "postgres",
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: Number(process.env.DB_PORT) || 5432,
    DB_NAME,
    DB_USER: process.env.DB_USER || "postgres",
    DB_PASSWORD: process.env.DB_PASSWORD || "postgres",
    GPT_API_KEY: process.env.GPT_API_KEY || undefined,
  };
};

const env = getEnv();

export default env;
