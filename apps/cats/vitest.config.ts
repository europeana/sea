import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./server", import.meta.url)),
    },
    conditions: ["@europeana/source", "import", "default"],
  },
  ssr: {
    resolve: {
      conditions: ["@europeana/source", "import", "default"],
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
