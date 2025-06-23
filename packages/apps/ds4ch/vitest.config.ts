import { defineVitestConfig } from "@nuxt/test-utils/config";
import { coverageConfigDefaults } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineVitestConfig({
  test: {
    coverage: {
      exclude: [...coverageConfigDefaults.exclude, "nuxt.config.ts"],
    },
    extends: true,
    setupFiles: ["tests/unit.setup.ts"],
    environment: "nuxt",
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL(".", import.meta.url)),
      },
    },
  },
});
