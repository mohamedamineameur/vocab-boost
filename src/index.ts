import http from "http";
import { fileURLToPath } from "url";
import path from "path";
import app from "./app.ts";
import env from "./config/env.ts";
import { database, initModels } from "./models/index.ts";
import { addCategories } from "./seeds/categoriesAdding.ts";
import { addWords } from "./seeds/wordsAdding.ts";

// 🔥 Importer explicitement les nouveaux modèles pour forcer leur initialisation
import "./models/user-activity.model.ts";
import "./models/user-achievement.model.ts";
import "./models/user-streak.model.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = env.PORT || 5010;

// 🔗 Initialiser les relations entre modèles AVANT la sync
initModels();

database
  .sync()
  .then(async () => {
    console.log("✅ Database synced successfully");

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
