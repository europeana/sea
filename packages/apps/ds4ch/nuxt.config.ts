// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  css: ["/assets/scss/main.scss"],
  devtools: { enabled: true },
  modules: ["@nuxtjs/i18n", "@nuxt/test-utils/module"],
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
    locales: [
      { code: "bg", name: "Български", file: "./bg.json" },
      { code: "cs", name: "Čeština", file: "./cs.json" },
      { code: "da", name: "Dansk", file: "./da.json" },
      { code: "de", name: "Deutsch", file: "./de.json" },
      { code: "el", name: "Ελληνικά", file: "./el.json" },
      { code: "en", name: "English", file: "./en.json" },
      { code: "es", name: "Español", file: "./es.json" },
      { code: "et", name: "Eesti", file: "./et.json" },
      { code: "fi", name: "Suomi", file: "./fi.json" },
      { code: "fr", name: "Français", file: "./fr.json" },
      { code: "ga", name: "Gaeilge", file: "./ga.json" },
      { code: "hr", name: "Hrvatski", file: "./hr.json" },
      { code: "hu", name: "Magyar", file: "./hu.json" },
      { code: "it", name: "Italiano", file: "./it.json" },
      { code: "lt", name: "Lietuvių", file: "./lt.json" },
      { code: "lv", name: "Latviešu", file: "./lv.json" },
      { code: "mt", name: "Malti", file: "./mt.json" },
      { code: "nl", name: "Nederlands", file: "./nl.json" },
      { code: "pl", name: "Polski", file: "./pl.json" },
      { code: "pt", name: "Português", file: "./pt.json" },
      { code: "ro", name: "Română", file: "./ro.json" },
      { code: "sk", name: "Slovenčina", file: "./sk.json" },
      { code: "sl", name: "Slovenščina", file: "./sl.json" },
      { code: "sv", name: "Svenska", file: "./sv.json" },
    ],
  },
});
