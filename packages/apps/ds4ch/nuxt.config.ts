import i18nLocales from "./i18n/locales";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  css: ["/assets/scss/main.scss"],
  devtools: { enabled: true },
  modules: ["@nuxtjs/i18n", "@nuxtjs/storybook", "@nuxt/test-utils/module"],
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
