import i18nLocales from "./i18n/locales";
import rollupPluginGraphql from "@rollup/plugin-graphql";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  css: ["/assets/scss/main.scss"],
  devtools: { enabled: true },
  extends: "@europeana/sea-base-layer",
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
    plugins: [rollupPluginGraphql()],
  },
  runtimeConfig: {
    public: {
      baseUrl: "",
      contentful: {
        accessToken: {
          delivery: null,
          preview: null,
        },
        environmentId: null,
        graphqlUrl: null,
        spaceId: null,
      },
      defaultThumbnail: "",
      internalLinkDomain: "",
    },
  },
  i18n: {
    bundle: {
      optimizeTranslationDirective: false,
    },
    defaultLocale: "en",
    detectBrowserLanguage: {
      useCookie: false,
    },
    strategy: "prefix",
    locales: i18nLocales.map((locale) => ({
      ...locale,
      file: `./${locale.code}.json`,
    })),
  },
  watch: ["graphql", "i18n"],
});
