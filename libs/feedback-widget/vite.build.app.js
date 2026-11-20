import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

import viteConfig from "./vite.config.js";

export default defineConfig({
  ...viteConfig,
  build: {
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(new URL("./src/main.js", import.meta.url)),
      name: "EuropeanaFeedbackWidget",
      fileName: "europeana-feedback-widget.app",
      formats: ["es"],
    },
    rollupOptions: {
      // TODO: should Vue be externalised here too?
      output: {
        assetFileNames: "europeana-feedback-widget.[ext]",
      },
    },
  },
});
