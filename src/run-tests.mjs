import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// reconstruire __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// chemin vers ton dossier de tests
const testDir = path.join(__dirname, "specs");

function getFilesWithOnly(dir) {
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      result.push(...getFilesWithOnly(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".test.ts") ||
        entry.name.endsWith(".test.tsx") ||
        entry.name.endsWith(".test.js"))
    ) {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (
        content.includes("test.only") ||
        content.includes("it.only") ||
        content.includes("describe.only")
      ) {
        result.push(fullPath);
      }
    }
  }

  return result;
}

const filesWithOnly = getFilesWithOnly(testDir);

if (filesWithOnly.length > 0) {
  console.log(
    "✅ test.only found – Running only files with .only:\n",
    filesWithOnly.join("\n")
  );
  const filesArg = filesWithOnly.map((f) => `"${f}"`).join(" ");
  execSync(
    `NODE_ENV=test node --experimental-vm-modules --no-warnings ./node_modules/jest/bin/jest.js ${filesArg} --runInBand --detectOpenHandles --forceExit`,
    { stdio: "inherit" }
  );
} else {
  console.log("🔁 No test.only found – Running all tests...");
  execSync(
    `NODE_ENV=test node --experimental-vm-modules --no-warnings ./node_modules/jest/bin/jest.js --runInBand`,
    { stdio: "inherit" }
  );
}
