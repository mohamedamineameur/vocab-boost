import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// reconstruire __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// chemin vers ton dossier de tests
const testDir = path.join(__dirname, "specs");

// Récupérer les arguments passés à npm test
const args = process.argv.slice(2);
const testNamePattern = args.find(arg => arg.startsWith('--testNamePattern='));
const testPathPattern = args.find(arg => arg.startsWith('--testPathPattern='));

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

// Construire la commande Jest avec les arguments appropriés
let jestCommand = `NODE_ENV=test node --experimental-vm-modules --no-warnings ./node_modules/jest/bin/jest.js --runInBand`;

// Ajouter les arguments de pattern si fournis
if (testNamePattern) {
  jestCommand += ` ${testNamePattern}`;
  console.log(`🎯 Running tests with pattern: ${testNamePattern}`);
}
if (testPathPattern) {
  jestCommand += ` ${testPathPattern}`;
  console.log(`📁 Running tests in path: ${testPathPattern}`);
}

// Ajouter les fichiers avec .only si trouvés
if (filesWithOnly.length > 0) {
  console.log(
    "✅ test.only found – Running only files with .only:\n",
    filesWithOnly.join("\n")
  );
  const filesArg = filesWithOnly.map((f) => `"${f}"`).join(" ");
  jestCommand = `NODE_ENV=test node --experimental-vm-modules --no-warnings ./node_modules/jest/bin/jest.js ${filesArg} --runInBand --detectOpenHandles --forceExit`;
} else if (!testNamePattern && !testPathPattern) {
  console.log("🔁 No test.only found – Running all tests...");
}

// Ajouter les flags de détection si pas de .only
if (filesWithOnly.length === 0) {
  jestCommand += ` --detectOpenHandles --forceExit`;
}

console.log(`🚀 Executing: ${jestCommand}`);
execSync(jestCommand, { stdio: "inherit" });
