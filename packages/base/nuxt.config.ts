export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      matomo: {
        host: null,
        siteId: null,
      },
    },
  },
});
