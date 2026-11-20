import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

import viteConfig from "./vite.config.js";

export default defineConfig({
  ...viteConfig,
  build: {
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL("./src/index.js", import.meta.url)),
      name: "EuropeanaMap",
      fileName: "europeana-map",
      formats: ["es", "iife"],
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        assetFileNames: "europeana-map.[ext]",
        globals: {
          vue: "Vue",
        },
      },
    },
    sourcemap: true,
  },
});
