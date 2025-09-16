import http from "http";
import { fileURLToPath } from "url";
import path from "path";
import app from "./app.ts";
import env from "./config/env.ts";
import { database, initModels } from "./models/index.ts";
import { addCategories } from "./seeds/categoriesAdding.ts";
import { addWords } from "./seeds/wordsAdding.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = env.PORT || 5010;

database
  .sync()
  .then(async () => {
    initModels();

    // 🚀 Lancement en HTTP
    http.createServer(app).listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running at http://192.168.2.19:${PORT}`);
      console.log(`Env mode: ${env.NODE_ENV}`);
    });

    await addCategories();
    await addWords();
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  });
