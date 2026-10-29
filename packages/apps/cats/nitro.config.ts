import { defineNitroConfig } from "nitropack/config";
import { fileURLToPath } from "node:url";

// https://nitro.build/config
export default defineNitroConfig({
  alias: {
    "@": fileURLToPath(new URL("./server", import.meta.url)),
  },
  compatibilityDate: "2025-09-17",
  srcDir: "server",
  runtimeConfig: {
    contentful: {
      defaultLocale: "en-GB",
      space: null,
      environment: null,
      accessToken: null,
    },
    eTranslation: {
      deliveries: null,
      notifications: {
        failure: null,
        success: null,
      },
      password: null,
      url: null,
      username: null,
    },
    redis: {
      tls: {
        ca: null,
      },
      url: null,
    },
    zoho: {
      bulkReadCallbackUrl: null,
      crm: {
        participation: null,
      },
      clientId: null,
      clientSecret: null,
      serviceOrgId: null,
    },
  },
});
