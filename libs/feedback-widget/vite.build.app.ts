import { fileURLToPath, URL } from "node:url";
import { defineConfig, mergeConfig } from "vite";

import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    build: {
      emptyOutDir: false,
      lib: {
        entry: fileURLToPath(new URL("./src/main.ts", import.meta.url)),
        name: "EuropeanaFeedbackWidget",
        fileName: "europeana-feedback-widget.app",
        formats: ["es"],
      },
      rollupOptions: {
        output: {
          assetFileNames: "europeana-feedback-widget.[ext]",
        },
      },
    },
  }),
);
