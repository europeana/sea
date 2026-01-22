import rollupPluginGraphql from "@rollup/plugin-graphql";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",

  devtools: { enabled: true },

  modules: ["@europeana/elastic-apm-nuxt", "@nuxt/eslint", "@nuxtjs/i18n"],

  runtimeConfig: {
    public: {
      cookieConsent: { maxAge: 1296000 }, // 15 days
      matomo: {
        host: null,
        siteId: null,
      },
    },
  },

  vite: {
    plugins: [rollupPluginGraphql()],
  },
});
