// TODO: extract some of this into a Nitro plugin so Nitro apps not
//       using Nuxt can also be instrumented, e.g. CATS

import {
  addPlugin,
  addTemplate,
  createResolver,
  defineNuxtModule,
} from "@nuxt/kit";

import defaults from "./elastic-apm.config.json";

export default defineNuxtModule({
  meta: {
    name: "@europeana/elastic-apm-nuxt",
    configKey: "elasticApm",
    compatibility: {
      nuxt: ">=3.0.0",
    },
  },

  defaults,

  setup(moduleOptions, nuxt) {
    const CONFIG_FILENAME = "elastic-apm.config";
    const SERVER_FILENAME = "elastic-apm.server";

    const buildDirResolver = createResolver(nuxt.options.buildDir);
    const moduleDirResolver = createResolver(import.meta.url);

    addPlugin({
      src: moduleDirResolver.resolve("./plugins/01-elastic-apm.server.ts"),
      mode: "server",
    });
    // TODO: add client plugin

    addTemplate({
      filename: `${CONFIG_FILENAME}.json`,
      getContents: () => JSON.stringify(moduleOptions, null, 2),
      write: true,
    });
    addTemplate({
      filename: `${SERVER_FILENAME}.js`,
      src: moduleDirResolver.resolve(`./${SERVER_FILENAME}.js`),
      write: true,
    });

    nuxt.hooks.hook("nitro:build:before", (nitro) => {
      nitro.hooks.hook("rollup:before", (nitro, rollupConfig) => {
        const filePrefix = "\0virtual:elastic-apm-server:";

        const rollupPlugin = {
          name: "rollup-plugin-inject-elastic-apm-server-files",

          buildStart() {
            this.emitFile({
              type: "chunk",
              id: `${filePrefix}${SERVER_FILENAME}.js`,
              fileName: `${SERVER_FILENAME}.mjs`,
            });
          },

          resolveId(source) {
            if (source.startsWith(filePrefix)) {
              const filename = source.replace(filePrefix, "");
              const configPath = buildDirResolver.resolve(`./${filename}`);

              return { id: configPath };
            }

            return null;
          },
        };

        rollupConfig.plugins.push(rollupPlugin);
      });
    });
  },
});
