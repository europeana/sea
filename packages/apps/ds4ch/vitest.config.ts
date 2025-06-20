import { defineVitestConfig } from "@nuxt/test-utils/config";
import { coverageConfigDefaults } from "vitest/config";

export default defineVitestConfig({
  test: {
    include: ["**/*.spec.js"],
    coverage: {
      exclude: [...coverageConfigDefaults.exclude, "nuxt.config.ts"],
    },
    setupFiles: ["tests/unit.setup.ts"],
  },
});
