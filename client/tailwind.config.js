// tailwind.config.js aggiornato
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'soft-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'soft': '0.5rem',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'spin-slow': 'spin 6s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  daisyui: {
    themes: [
      {
        // Tema "modern" - Light professionale
        modern: {
          "primary": "#2563eb",      // Blue 600
          "secondary": "#7c3aed",    // Violet 600
          "accent": "#0891b2",       // Cyan 600
          "neutral": "#1f2937",      // Gray 800
          "base-100": "#ffffff",
          "base-200": "#f9fafb",     // Gray 50
          "base-300": "#e5e7eb",     // Gray 200
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },

        // Tema "midnight" - Dark ad alto contrasto
        midnight: {
          "primary": "#60a5fa",      // Blue 400
          "secondary": "#a78bfa",    // Violet 400
          "accent": "#22d3ee",       // Cyan 400
          "neutral": "#e5e7eb",      // Gray 200
          "base-100": "#0f172a",     // Slate 900
          "base-200": "#1e293b",     // Slate 800
          "base-300": "#334155",     // Slate 700
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },

        // Tema "festive" - Christmas (temporaneo fino al 15 gen)
        festive: {
          "primary": "#dc2626",      // Red 600 - rosso natalizio
          "secondary": "#059669",    // Emerald 600 - verde natalizio
          "accent": "#f59e0b",       // Amber 500 - oro
          "neutral": "#1f2937",
          "base-100": "#fef2f2",     // Red 50 - sfondo caldo
          "base-200": "#fee2e2",     // Red 100
          "base-300": "#fecaca",     // Red 200
          "info": "#3b82f6",
          "success": "#059669",
          "warning": "#f59e0b",
          "error": "#dc2626",
        }
      }
    ],
  },
  plugins: [require("daisyui")],
};