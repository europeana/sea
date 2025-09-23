import { defineNitroConfig } from "nitropack/config";

// https://nitro.build/config
export default defineNitroConfig({
  compatibilityDate: "2025-09-17",
  srcDir: "server",
  runtimeConfig: {
    contentful: {
      space: null,
      environment: null,
      accessToken: null,
    },
    eTranslation: {
      deliveries: null,
      password: null,
      url: null,
      username: null,
    },
    redis: {
      tls: {
        // TODO: this will be base64-encoded; can we decode it here?
        ca: null,
      },
      url: null,
    },
  },
});
