import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./server", import.meta.url)),
    },
    conditions: ["@europeana/source", "node", "import", "require", "default"],
  },
  ssr: {
    resolve: {
      conditions: ["@europeana/source", "node", "import", "require", "default"],
    },
  },
  test: {
    clearMocks: true,
    server: {
      deps: {
        inline: [/^@europeana\//],
      },
    },
    setupFiles: ["./tests/setup.mocks.ts"],
    unstubGlobals: true,
  },
});
