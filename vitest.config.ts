import { defineConfig, coverageConfigDefaults } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.spec.js"],
    projects: ["packages/apps/*"],
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        "**/*.stories.ts",
        "**/*.config.[jt]s",
        "packages/apps/ds4ch/i18n/*",
      ],
    },
  },
});
