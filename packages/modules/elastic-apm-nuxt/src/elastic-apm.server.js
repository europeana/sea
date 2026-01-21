import apm from "elastic-apm-node";
import defaults from "./elastic-apm.config.json";

console.log("elastic-apm-nuxt server.js defaults", defaults);

const runtimeConfig = () => ({
  environment:
    process.env.NUXT_PUBLIC_ELASTIC_APM_ENVIRONMENT || process.env.NODE_ENV,
  serverUrl: process.env.NUXT_PUBLIC_ELASTIC_APM_SERVER_URL,
  serviceName: process.env.NUXT_PUBLIC_ELASTIC_APM_SERVICE_NAME,
  serviceVersion: process.env.NUXT_PUBLIC_ELASTIC_APM_SERVICE_VERSION,
});

const env = runtimeConfig();
console.log("elastic-apm-nuxt server.js env", env);

const config = { ...defaults };
for (const key in env) {
  if (env[key]) {
    config[key] = env[key];
  }
}

console.log("elastic-apm-nuxt server.js merged config", config);

if (config.serverUrl) {
  apm.start(config);
}
