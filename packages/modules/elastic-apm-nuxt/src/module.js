import { addTemplate, createResolver, defineNuxtModule } from "@nuxt/kit";

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
    console.log("setup elastic-apm-nuxt moduleOptions", moduleOptions);
    console.log("setup elastic-apm-nuxt import.meta.url", import.meta.url);
    console.log(
      "setup elastic-apm-nuxt nuxt.options.buildDir",
      nuxt.options.buildDir,
    );

    const CONFIG_FILENAME = "elastic-apm.config";
    const SERVER_FILENAME = "elastic-apm.server";

    const buildDirResolver = createResolver(nuxt.options.buildDir);
    const moduleDirResolver = createResolver(import.meta.url);

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

    nuxt.hooks.hook("nitro:init", (nitro) => {
      nitro.hooks.hook("rollup:before", (nitro, rollupConfig) => {
        const filePrefix = "\0virtual:elastic-apm-server:";

        const rollupPlugin = {
          name: "rollup-plugin-inject-elastic-apm-server-files",

          buildStart() {
            console.log(
              "buildStart nitro.options.srcDir",
              nitro.options.srcDir,
            );
            console.log(
              "buildStart nitro.options.rootDir",
              nitro.options.rootDir,
            );
            this.emitFile({
              type: "chunk",
              id: `${filePrefix}${SERVER_FILENAME}.js`,
              fileName: `${SERVER_FILENAME}.mjs`,
            });
          },

          resolveId(source) {
            if (source.startsWith(filePrefix)) {
              // TODO: prevent this making it into the main server.js chunks
              //       and trying to load elastic-apm/lru-cache when the file
              //       is not explicitly imported
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
