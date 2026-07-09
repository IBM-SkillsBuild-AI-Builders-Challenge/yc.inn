/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f4f3ee",
        charcoal: "#2c2c2c",
        taupe: "#b1ada1",
        bronze: "#c15f3c",
        border: "#3d3d3d",
        input: "#3d3d3d",
        ring: "#c15f3c",
        background: "#2c2c2c",
        foreground: "#f4f3ee",
        primary: {
          DEFAULT: "#c15f3c",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#2c2c2c",
          foreground: "#f4f3ee",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#3d3d3d",
          foreground: "#b1ada1",
        },
        accent: {
          DEFAULT: "#c15f3c",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#2c2c2c",
          foreground: "#f4f3ee",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
        xl: "0.75rem",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
