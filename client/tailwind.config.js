// tailwind.config.js aggiornato
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'cartoon': {
          'pink': '#FF6B9D',
          'yellow': '#FFC107',
          'blue': '#4ECDC4',
          'purple': '#9B59B6',
          'orange': '#FF8C42',
          'blue-dark': '#031e2bff',
        }
      },
      boxShadow: {
        'cartoon': '4px 4px 0px #000',
        'cartoon-hover': '6px 6px 0px #000',
        'cartoon-sm': '2px 2px 0px #000',
      },
      borderRadius: {
        'cartoon': '1.5rem',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
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
        cartoon: {
          "primary": "#FF6B9D",
          "secondary": "#4ECDC4",
          "accent": "#FFC107",
          "neutral": "#2A2A2A",
          "base-100": "#FFF8DC",
          "info": "#4ECDC4",
          "success": "#66D9A8",
          "warning": "#FFB347",
          "error": "#FF6B6B",
        },
      },
      "night",
    ],
  },
  plugins: [require("daisyui")],
};