import { defineVitestConfig } from "@nuxt/test-utils/config";
import { fileURLToPath } from "node:url";
import { coverageConfigDefaults } from "vitest/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL(".", import.meta.url)),
      },
    },
    setupFiles: ["../../vitest.nuxt.setup.ts"],
    coverage: {
      reporter: ["text", "html", "lcov"],
      exclude: [
        ...coverageConfigDefaults.exclude,
        "**/*.stories.ts",
        "**/*.config.[jt]s",
      ],
    },
  },
});
