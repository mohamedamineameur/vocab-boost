import database  from "../config/database.ts";

export const preTestSetup = async () => {
  await database.sync({ force: true });
};