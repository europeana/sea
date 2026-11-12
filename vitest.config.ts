import { defineConfig, coverageConfigDefaults } from "vitest/config";

export default defineConfig({
  test: {
    // NOTE: do not rely on globs like "apps/*" as it causes
    //       failures in the nuxt-environment test suites
    projects: [
      "apps/cats",
      "apps/ctf-apps",
      "apps/ds4ch",
      "libs/map-styles",
      "libs/map",
      "libs/sea-base-layer",
      "libs/vue-contentful-graphql",
      "libs/vue-visible-on-scroll",
      "libs/zoho-client",
    ],
    coverage: {
      reporter: ["text", "html", "lcov"],
      exclude: [
        ...coverageConfigDefaults.exclude,
        "**/*.json",
        "**/*.graphql",
        "**/*.svg",
        "**/*.scss",
        "**/*.stories.ts",
        "**/*.config.[jt]s",
        "tmp/**",
        "**/storybook-static/**",
        "**/tests/**",
      ],
    },
  },
});
