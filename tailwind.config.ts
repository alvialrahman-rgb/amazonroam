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
        amazon: {
          orange: "#FF9900",
          "orange-hover": "#E88B00",
          dark: "#232F3E",
          "dark-blue": "#37475A",
          blue: "#00A8E1",
          teal: "#067D62",
          light: "#FAFAFA",
        },
        category: {
          food: "#FF6B35",
          culture: "#7B61FF",
          outdoors: "#2ECC71",
          nightlife: "#E91E63",
          wellness: "#00BCD4",
          shopping: "#FF9900",
          entertainment: "#FFC107",
        },
      },
      fontFamily: {
        sans: [
          "Amazon Ember",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
