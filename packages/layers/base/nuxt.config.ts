import rollupPluginGraphql from "@rollup/plugin-graphql";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",

  devtools: { enabled: true },

  modules: ["@nuxt/eslint", "@nuxtjs/i18n"],

  runtimeConfig: {
    public: {
      cookieConsent: { maxAge: 1296000 }, // 15 days
      elastic: {
        apm: {
          environment: process.env.NODE_ENV,
          serverUrl: null,
          serviceName: null,
          serviceVersion: null, // TODO: derive from package.json
        },
      },
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
