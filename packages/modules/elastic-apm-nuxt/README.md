# `@europeana/elastic-apm-nuxt`

Nuxt module for app observability using Elastic APM.

## Installation

Install the NPM package:

```shell
pnpm install --save @europeana/elastic-apm-nuxt
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

The Nuxt dev/build commands needs to use the provided loader, `@europeana/elastic-apm-nuxt/loader`,
which registers the `elastic-apm-node` loader so that it may instrument libraries in the ES build.

When running the app, a generated server initialisation file, `elastic-apm.server.mjs` needs to be
loaded first, to start the APM before the Nuxt/Nitro/app stack is initialised.

#### Development

##### Preparatory run without server-side APM

```shell
NODE_OPTIONS='--import @europeana/elastic-apm-nuxt/loader' nuxt dev
```

##### Subsequent runs with server-side APM

```shell
NODE_OPTIONS='--import @europeana/elastic-apm-nuxt/loader --import ./.nuxt/dev/elastic-apm.server.mjs' nuxt dev
```

#### Production

##### Build

```shell
NODE_OPTIONS='--import @europeana/elastic-apm-nuxt/loader' nuxt build
```

##### Run

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

## Troubleshooting

### 500 errors on all SSR requests

If when running the built version of the app you get 500 errors for all SSR requests with errors about require/import/export, then try also adding to the Nuxt app's package dependencies `elastic-apm-node`.

## TODO

- rename to @europeana/nuxt-elastic-apm to be consistent w/ `vue-`
  pkg naming conventions?

## License

Licensed under the EUPL v1.2.
