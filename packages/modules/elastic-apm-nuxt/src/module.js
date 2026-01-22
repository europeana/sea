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

    addPlugin({
      src: moduleDirResolver.resolve("./plugins/01-elastic-apm.server.ts"),
      mode: "server",
    });

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

    // nuxt.hooks.hook("nitro:config", nitroConfig => {
    //   console.log("nitro:config nitroConfig.rollupConfig", nitroConfig.rollupConfig)
    //   nitroConfig.rollupConfig.output = { format: 'cjs' }
    // })

    nuxt.hooks.hook("nitro:build:before", (nitro) => {
      console.log(
        "nitro:build:before nitro.options.entry",
        JSON.stringify(nitro.options.entry, null, 2),
      );
      // console.log("nitro:build:before nitro.options.rollupConfig", JSON.stringify(nitro.options.rollupConfig, null, 2));

      // console.log("nitro:build:before nitro.options", JSON.stringify(nitro.options, null, 2));

      // nitro.options.rollupConfig.output.format = 'cjs'
      // nitro.options.rollupConfig.output.entryFileNames = '[name].cjs';
      //   nitro.options.rollupConfig.input = {
      //     // nitro default entrypoint at .output/server.js
      //     index: nitro.options.entry,
      //     // custom entrypoint at .output/custom.js
      //     custom: moduleDirResolver.resolve(`./${SERVER_FILENAME}.js`)
      //   };
    });

    nuxt.hooks.hook("nitro:init", (nitro) => {
      console.log(
        "nitro:init nitro.options.entry",
        JSON.stringify(nitro.options.entry, null, 2),
      );
      console.log(
        "nitro:init nitro.options.rollupConfig",
        JSON.stringify(nitro.options.rollupConfig, null, 2),
      );
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
