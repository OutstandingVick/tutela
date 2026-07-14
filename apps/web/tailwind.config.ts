import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}", "./providers/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#4A051C",
        graphite: "#094586",
        mist: "#D0FEF5",
        line: "#6FB4EB",
        pitch: "#094586",
        mint: "#6FB4EB",
        gold: "#6FB4EB",
        clay: "#4A051C",
        sky: "#6FB4EB"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(74, 5, 28, 0.11)"
      }
    }
  },
  plugins: []
};

export default config;
