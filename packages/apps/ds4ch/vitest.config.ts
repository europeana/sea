import { defineVitestConfig } from "@nuxt/test-utils/config";

import { fileURLToPath } from "node:url";

export default defineVitestConfig({
  test: {
    extends: true,
    setupFiles: ["tests/unit.setup.ts"],
    environment: "nuxt",
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL(".", import.meta.url)),
      },
    },
  },
});
