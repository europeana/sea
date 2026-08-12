import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

import viteConfig from "./vite.config.js";

export default defineConfig({
  ...viteConfig,
  build: {
    lib: {
      entry: fileURLToPath(
        new URL("./src/components/FeedbackWidget.vue", import.meta.url),
      ),
      fileName: "europeana-feedback-widget.component",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        assetFileNames: "europeana-feedback-widget.[ext]",
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
