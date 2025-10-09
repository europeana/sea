export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      cookieConsent: { maxAge: null },
      matomo: {
        host: null,
        siteId: null,
        disableCookies: true,
      },
    },
  },
});
