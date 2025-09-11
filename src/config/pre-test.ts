import database from "../config/database.ts";
import { initModels } from "../models/index.ts";

let modelsInitialized = false;

export const preTestSetup = async () => {
  if (!modelsInitialized) {
    initModels();            // 🔥 fait une seule fois
    modelsInitialized = true;
  }

  // reset la base de données avant chaque test
  await database.sync({ force: true });
};
