# `@europeana/elastic-apm-nuxt`

Nuxt module for app observability using Elastic APM.

## Installation

Install the NPM package:

```shell
pnpm install --save @europeana/elastic-apm/nuxt
```

Add the Nuxt module to your config:

```js
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@europeana/elastic-apm-nuxt"],
});
```

### Server-side instrumentation

For server-side instrumentation to work, it is necessary to modify both build and run commands.

#### Build

The Nuxt build command needs to use the elastic-apm-node loader:

```shell
NODE_OPTIONS='--loader elastic-apm-node/loader.mjs' nuxt build
```

#### Run

When running the app, a server initialisation file needs to be loaded first, to start the APM before Nuxt/Nitro/others start importing node libraries:

```shell
node --import ./.output/server/elastic-apm.server.mjs .output/server/index.mjs
```

## Configuration

Available configuration options:

- `environment`
- `serverUrl`
- `serviceName`
- `serviceVersion`

### Build-time

Module options may be supplied at build-time in the Nuxt `elasticApm` config section, and will be used as defaults for the module configuration unless overriden by runtime config.

`nuxt.config.ts`:

```js
import { name as packageName, version as packageVersion } from "./package.json";

export default defineNuxtConfig({
  modules: ["@europeana/elastic-apm-nuxt"],

  elasticApm: {
    // derive service name & version from package.json
    serviceName: packageName.replace(/^.*\//, ""),
    serviceVersion: packageVersion,
  },
});
```

### Runtime

Runtime config is in the `elasticApm` section of the public `runtimeConfig` config section.

`nuxt.config.ts`:

```js
import { name as packageName, version as packageVersion } from "./package.json";

export default defineNuxtConfig({
  modules: ["@europeana/elastic-apm-nuxt"],

  runtimeConfig: {
    public: {
      elasticApm: {
        // NUXT_PUBLIC_ELASTIC_APM_ENVIRONMENT=test
        environment: "",
        // NUXT_PUBLIC_ELASTIC_APM_SERVER_URL=https://apm.example.org
        serverUrl: "",
        // NUXT_PUBLIC_ELASTIC_APM_SERVICE_NAME=my-app
        serviceName: "",
        // NUXT_PUBLIC_ELASTIC_APM_SERVICE_VERSION=1.0.0
        serviceVersion: "",
      },
    },
  },
});
```

## TODO

- rename to @europeana/nuxt-elastic-apm to be consistent w/ `vue-`
  pkg naming conventions?

## License

Licensed under the EUPL v1.2.
