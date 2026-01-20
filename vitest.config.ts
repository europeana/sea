import { defineConfig, coverageConfigDefaults } from "vitest/config";

export default defineConfig({
  test: {
    // NOTE: do not rely on globs like "packages/*/*" as it causes
    //       failures in the nuxt-environment test suites
    projects: [
      "packages/apps/cats",
      "packages/apps/ds4ch",
      "packages/directives/vue-visible-on-scroll",
      "packages/layers/base",
      "packages/plugins/vue-contentful-graphql",
    ],
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        "**/*.stories.ts",
        "**/*.config.[jt]s",
      ],
    },
  },
});
