import rollupPluginGraphql from "@rollup/plugin-graphql";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",

  devtools: { enabled: true },

  modules: ["@nuxt/eslint", "@nuxtjs/i18n"],

  i18n: {
    bundle: {
      // NOTE: without this, inclusion of the @nuxtjs/i18n module results in
      //       inaccurate or absent test coverage reporting for .vue files.
      //       See: https://github.com/nuxt-modules/i18n/issues/3238#issuecomment-2672492536
      optimizeTranslationDirective: false,
    },
  },

  runtimeConfig: {
    public: {
      baseUrl: "",
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
      i18n: {
        baseUrl: "",
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

  sourcemap: {
    server: true,
    client: true,
  },
});
