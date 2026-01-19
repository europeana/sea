import { defineVitestProject } from "@nuxt/test-utils/config";

import { fileURLToPath } from "node:url";

export default defineVitestProject({
  test: {
    environment: "nuxt",
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL(".", import.meta.url)),
      },
    },
    name: "base",
    setupFiles: ["../vitest.nuxt.setup.ts"],
  },
});
