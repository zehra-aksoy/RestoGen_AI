import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#111827", muted: "#4b5563" },
        sage: { DEFAULT: "#059669", light: "#d1fae5" },
        clay: { DEFAULT: "#c4a574", light: "#faf6ef" },
        sidebar: { DEFAULT: "#1A433A" },
        cream: { DEFAULT: "#FAF7F2" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
