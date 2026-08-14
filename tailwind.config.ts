import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(212, 176, 102, 0.18), 0 24px 80px rgba(9, 18, 34, 0.24)",
      },
      colors: {
        ink: {
          950: "#07111d",
          900: "#0a1727",
          800: "#12253b",
        },
        sand: {
          50: "#f7f3ea",
          100: "#efe6d0",
          200: "#e6d1a0",
          300: "#d7b66c",
        },
      },
      backgroundImage: {
        "paper-grid":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
