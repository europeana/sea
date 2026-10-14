import { defineNitroConfig } from "nitropack/config";

// https://nitro.build/config
export default defineNitroConfig({
  compatibilityDate: "2026-10-14",
  srcDir: "server",
  runtimeConfig: {
    contentful: {
      space: null,
      environment: null,
      accessToken: null,
    },
    redis: {
      tls: {
        // TODO: this will be base64-encoded; can we decode it here?
        ca: null,
      },
      url: null,
    },
    zoho: {
      clientId: null,
      clientSecret: null,
      soid: null,
    },
  },
});
