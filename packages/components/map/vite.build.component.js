import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

import viteConfig from "./vite.config.js";

export default defineConfig({
  ...viteConfig,
  build: {
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(
        new URL("./src/components/EuropeanaMap.vue", import.meta.url),
      ),
      fileName: "europeana-map.component",
      formats: ["es"],
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
