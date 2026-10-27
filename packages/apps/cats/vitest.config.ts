import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    clearMocks: true,
    setupFiles: ["./tests/setup.mocks.ts"],
    unstubGlobals: true,
  },
});
