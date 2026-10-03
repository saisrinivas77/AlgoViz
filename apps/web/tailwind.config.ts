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
        // ── Legacy tokens — kept for /playground compatibility ─────────────
        background:          "#141412",
        surface:             "#1E1E1C",
        "surface-secondary": "#252522",
        border:              "#2E2E2C",
        text:                "#E8E6E0",
        muted:               "#9E9E98",
        accent:              "#6366f1",       // indigo – only used in playground
        "accent-hover":      "#4f46e5",
        success:             "#10b981",
        warning:             "#f59e0b",
        error:               "#ef4444",
        info:                "#3b82f6",

        // ── Homepage design system tokens ─────────────────────────────────
        // Light section palette
        "page":              "#F5F4F0",
        "page-surface":      "#FFFFFF",
        "page-muted":        "#EDECE8",
        "page-raised":       "#F0EFE9",
        "page-border":       "#DDDDD8",
        "page-border-strong":"#C4C4BE",

        // Dark section palette (code panels, dark sections)
        "code-bg":           "#141412",
        "code-surface":      "#1E1E1C",
        "code-raised":       "#252522",
        "code-border":       "#2E2E2C",
        "code-border-strong":"#3E3E3A",

        // Foreground tokens
        "fg-primary":        "#1C1C1A",
        "fg-secondary":      "#5C5C58",
        "fg-tertiary":       "#8C8C87",
        "fg-code":           "#E8E6E0",
        "fg-code-secondary": "#9E9E98",
        "fg-code-muted":     "#5E5E58",

        // Semantic accents — restrained, purposeful
        "amber-accent":      "#B45309",
        "green-accent":      "#2D6A30",
        "red-accent":        "#B91C1C",
        "stone-accent":      "#78716C",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Cascadia Code", "Fira Code", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter:  "-0.025em",
        tight:    "-0.015em",
        wide:     "0.05em",
        widest:   "0.2em",
      },
      lineHeight: {
        display: "1.0",
        tight:   "1.1",
        snug:    "1.25",
      },
      borderRadius: {
        none:  "0",
        sm:    "3px",
        DEFAULT: "6px",
        md:    "8px",
        lg:    "12px",
        xl:    "16px",
      },
    },
  },
  plugins: [],
};

export default config;
