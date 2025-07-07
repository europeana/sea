import i18nLocales from "./i18n/locales";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  css: ["/assets/scss/main.scss"],
  devtools: { enabled: true },
  extends: "../../base",
  modules: ["@nuxt/eslint", "@nuxt/test-utils/module", "@nuxtjs/i18n"],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Silence deprecation warnings until Bootstrap 5 updates Sass: https://github.com/twbs/bootstrap/issues/40962
          silenceDeprecations: ["global-builtin", "import", "color-functions"],
        },
      },
    },
  },
  runtimeConfig: {
    // The private keys which are only available server-side
    // apiSecret: '123',
    // Keys within public are also exposed client-side
    public: {
      contentful: {
        graphQlOrigin: null,
        spaceId: null,
        environmentId: null,
        accessToken: {
          delivery: null,
          preview: null,
        },
      },
    },
  },
  i18n: {
    bundle: {
      optimizeTranslationDirective: false,
    },
    defaultLocale: "en",
    strategy: "prefix",
    locales: i18nLocales.map((locale) => ({
      ...locale,
      file: `./${locale.code}.json`,
    })),
  },
});
