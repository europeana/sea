export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      cookieConsent: { maxAge: 1296000 }, // 15 days
      matomo: {
        host: null,
        siteId: null,
        disableCookies: true,
      },
    },
  },
});
