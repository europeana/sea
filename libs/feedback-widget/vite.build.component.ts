import { fileURLToPath, URL } from "node:url";
import { defineConfig, mergeConfig } from "vite";

import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
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
  }),
);
