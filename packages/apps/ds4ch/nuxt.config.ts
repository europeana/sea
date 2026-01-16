import i18nLocales from "./i18n/locales";

import { name as packageName, version as packageVersion } from "./package.json";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  css: ["/assets/scss/main.scss"],
  devtools: { enabled: true },
  extends: "@europeana/sea-base-layer",
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Silence deprecation warnings until Bootstrap 5 updates Sass: https://github.com/twbs/bootstrap/issues/40962
          silenceDeprecations: [
            "global-builtin",
            "import",
            "color-functions",
            "if-function",
          ],
        },
      },
    },
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
      elastic: {
        apm: {
          serviceName: packageName.replace(/^.*\//, ""),
          serviceVersion: packageVersion,
        },
      },
      defaultThumbnail: "",
      internalLinkDomain: "",
    },
  },
  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
    bundle: {
      optimizeTranslationDirective: false,
    },
    defaultLocale: "en",
    detectBrowserLanguage: {
      useCookie: true,
    },
    strategy: "prefix",
    locales: i18nLocales.map((locale) => ({
      ...locale,
      file: `./${locale.code}.json`,
    })),
  },
  watch: ["graphql", "i18n"],
});
