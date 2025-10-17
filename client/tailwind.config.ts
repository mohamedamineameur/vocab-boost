import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#22C55E',
      }
    },
  },
  plugins: [],
};

export default config;
