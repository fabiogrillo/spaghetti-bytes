// tailwind.config.js - Custom Spaghetti Bytes theme system
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
        light: {
          "primary": "#E85D04",
          "primary-content": "#FFFFFF",
          "secondary": "#6D28D9",
          "secondary-content": "#FFFFFF",
          "accent": "#0891B2",
          "accent-content": "#FFFFFF",
          "neutral": "#1E293B",
          "neutral-content": "#F8FAFC",
          "base-100": "#FFFBF5",
          "base-200": "#FFF3E0",
          "base-300": "#FFE0B2",
          "base-content": "#1E293B",
          "info": "#3B82F6",
          "success": "#16A34A",
          "warning": "#F59E0B",
          "error": "#DC2626",
        },
      },
      {
        dark: {
          "primary": "#FB923C",
          "primary-content": "#1C1917",
          "secondary": "#A78BFA",
          "secondary-content": "#1C1917",
          "accent": "#22D3EE",
          "accent-content": "#1C1917",
          "neutral": "#0F172A",
          "neutral-content": "#E2E8F0",
          "base-100": "#1A1A2E",
          "base-200": "#16213E",
          "base-300": "#1F3460",
          "base-content": "#E2E8F0",
          "info": "#60A5FA",
          "success": "#4ADE80",
          "warning": "#FBBF24",
          "error": "#F87171",
        },
      },
    ],
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
};
