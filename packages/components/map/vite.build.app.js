import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

import viteConfig from "./vite.config.js";

export default defineConfig({
  ...viteConfig,
  build: {
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(new URL("./src/index.js", import.meta.url)),
      name: "EuropeanaMap",
      fileName: "europeana-map.app",
      formats: ["es", "iife"],
    },
    rollupOptions: {
      output: {
        assetFileNames: "europeana-map.[ext]",
      },
    },
    sourcemap: true,
  },
});
