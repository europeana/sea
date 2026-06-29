import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

import viteConfig from "./vite.config.js";

export default defineConfig({
  ...viteConfig,
  build: {
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(new URL("./src/app.js", import.meta.url)),
      name: "EuropeanaMap",
      fileName: "europeana-map.app",
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        assetFileNames: "europeana-map.[ext]",
      },
    },
    sourcemap: true,
  },
});
