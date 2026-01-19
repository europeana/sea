import { defineConfig, coverageConfigDefaults } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/*/*"],
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        "**/*.stories.ts",
        "**/*.config.[jt]s",
      ],
    },
  },
});
