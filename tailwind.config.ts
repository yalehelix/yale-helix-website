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
        // Refined-dark Yale palette. One locked accent. No pure black/white.
        bg: "#0a0a0a",
        "bg-elev": "#111317",
        surface: "rgba(255, 255, 255, 0.04)",
        "surface-hover": "rgba(255, 255, 255, 0.07)",
        hairline: "rgba(255, 255, 255, 0.10)",
        text: "#f4f5f6",
        "text-muted": "#9aa1a8",
        yale: "#00356b",
        "yale-light": "#0a4a8f",
        accent: "#4268ff",
        "accent-fg": "#f5f7ff",
        "accent-soft": "rgba(66, 104, 255, 0.16)",
        error: "#d96b6b",
        // Light sections (alternating bands like the original site)
        light: "#f4f4f2",
        "light-surface": "#fbfbfa",
        ink: "#10131a",
        "ink-muted": "#565b64",
        "light-line": "rgba(16, 19, 26, 0.10)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        // One corner-radius scale for the whole site.
        md: "0.5rem",
        xl: "0.75rem",
      },
      boxShadow: {
        // Tinted shadow matching the accent hue (no generic black glow).
        accent: "0 10px 40px -12px rgba(66, 104, 255, 0.4)",
        elev: "0 16px 50px -20px rgba(0, 0, 0, 0.7)",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};
export default config;
