export default {
  preset: "ts-jest/presets/default-esm", // 👈 preset spécial ESM
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        useESM: true, // 👈 obligatoire
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts"], // 👈 sinon Jest croit que .ts = CommonJS
  moduleFileExtensions: ["ts", "tsx", "js", "mjs", "cjs", "json", "node"],
  testMatch: ["**/src/specs/**/*.test.(ts|tsx|js)"],
};
