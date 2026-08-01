import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// rollup-plugin-visualizer declares engines ">=22" and is only ever needed for
// `npm run analyze`, so it is loaded on demand instead of on every production
// build, where it would drag its Node requirement into deploys for nothing.
const plugins = [react()];
if (process.env.ANALYZE) {
  const { visualizer } = await import("rollup-plugin-visualizer");
  plugins.push(
    visualizer({ filename: "build/stats.html", gzipSize: true, open: true })
  );
}

export default defineConfig({
  plugins,

  server: {
    port: 3000,
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
    },
  },

  build: {
    // vercel.json declares distDir "build" and routes /static/(.*) to
    // /client/static/$1, so both names have to match what CRA produced.
    outDir: "build",
    assetsDir: "static",
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.js"],
  },
});
