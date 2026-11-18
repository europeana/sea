// nitro.config.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { defineNitroConfig } from "nitropack/config";

const require = createRequire(import.meta.url);
const bullBoardUiDir = path.dirname(
  require.resolve("@bull-board/ui/package.json"),
);

// https://nitro.build
export default defineNitroConfig({
  alias: {
    "@": fileURLToPath(new URL("./server", import.meta.url)),
  },
  compatibilityDate: "2025-09-17",
  srcDir: "server",
  externals: {
    external: ["@bull-board/api", "@bull-board/h3", "@bull-board/ui"],
    traceInclude: [require.resolve("tslib")],
  },
  hooks: {
    compiled(nitro) {
      const targetDir = path.join(
        nitro.options.output.serverDir,
        "node_modules/@bull-board/ui",
      );
      fs.mkdirSync(targetDir, { recursive: true });
      fs.cpSync(
        path.join(bullBoardUiDir, "package.json"),
        path.join(targetDir, "package.json"),
      );
      fs.cpSync(
        path.join(bullBoardUiDir, "dist"),
        path.join(targetDir, "dist"),
        { recursive: true },
      );
    },
  },
  exportConditions: [
    "@europeana/source",
    "node",
    "import",
    "require",
    "default",
  ],
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
      clientId: null,
      clientSecret: null,
      serviceOrgId: null,
    },
  },
});
