// react-scripts used to detect tailwind.config.js and wire Tailwind into its
// PostCSS chain implicitly. Vite has no such special case, so the pipeline is
// declared explicitly here.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
