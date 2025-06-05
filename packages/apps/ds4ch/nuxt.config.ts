// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  css: ["/assets/scss/main.scss"],
  devtools: { enabled: true },
  modules: [],
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
});
