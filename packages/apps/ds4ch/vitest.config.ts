import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    include: ["**/*.spec.js"],
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
