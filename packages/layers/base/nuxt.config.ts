import rollupPluginGraphql from "@rollup/plugin-graphql";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",

  devtools: { enabled: true },

  modules: ["@europeana/elastic-apm-nuxt", "@nuxt/eslint", "@nuxtjs/i18n"],

  runtimeConfig: {
    public: {
      cookieConsent: { maxAge: 1296000 }, // 15 days
      feedbackWidget: {
        apiUrl: "https://www.europeana.eu/_api/jira-service-desk/feedback",
        fallbackLocale: undefined,
        faqUrl: undefined,
        locale: undefined,
      },
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
