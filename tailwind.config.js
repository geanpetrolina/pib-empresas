/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Paleta PIB Empresas — institucional premium
        pib: {
          navy: {
            50: "#eef2f8",
            100: "#d7e1ef",
            200: "#b3c6dd",
            300: "#85a3c6",
            400: "#5a7da9",
            500: "#3c5f8c",
            600: "#2a4870",
            700: "#1f3759",
            800: "#142847",
            900: "#0b1a33",
            950: "#060f20",
          },
          gold: {
            50: "#fdf8ec",
            100: "#faedc9",
            200: "#f4da93",
            300: "#edc35c",
            400: "#e3ab33",
            500: "#cb9322",
            600: "#a8741a",
            700: "#86581a",
            800: "#6e481c",
            900: "#5c3d1d",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        shimmer: "shimmer 2s infinite linear",
      },
      boxShadow: {
        premium: "0 4px 24px -4px rgba(11, 26, 51, 0.12), 0 1px 2px rgba(11, 26, 51, 0.06)",
        "premium-lg": "0 12px 40px -8px rgba(11, 26, 51, 0.18)",
        gold: "0 4px 16px -2px rgba(203, 147, 34, 0.35)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #f4da93 0%, #cb9322 50%, #a8741a 100%)",
        "navy-gradient": "linear-gradient(160deg, #142847 0%, #0b1a33 60%, #060f20 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
