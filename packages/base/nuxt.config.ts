export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      cookieConsent: { maxAge: 1296000 }, // 15 days
      elastic: {
        apm: {
          environment: process.env.NODE_ENV,
          serverUrl: null,
          serviceName: null,
          serviceVersion: null, // TODO: derive from package.json
        },
      },
      matomo: {
        host: null,
        siteId: null,
      },
    },
  },
});
