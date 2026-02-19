import { defineConfig, coverageConfigDefaults } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "html", "lcov"],
      exclude: [...coverageConfigDefaults.exclude, "**/*.config.[jt]s"],
    },
  },
});
