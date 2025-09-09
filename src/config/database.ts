import { Sequelize } from "sequelize";
import env from "./env.ts";

const database = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: env.DB_DIALECT as "postgres",
  logging: env.NODE_ENV === "development" ? console.log : false,
});

export default database;
