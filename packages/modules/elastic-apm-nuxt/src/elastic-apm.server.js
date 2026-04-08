import apm from "elastic-apm-node";
import defaults from "./elastic-apm.config.json";

const runtimeConfig = () => ({
  environment:
    process.env.NUXT_PUBLIC_ELASTIC_APM_ENVIRONMENT || process.env.NODE_ENV,
  serverUrl: process.env.NUXT_PUBLIC_ELASTIC_APM_SERVER_URL,
  serviceName: process.env.NUXT_PUBLIC_ELASTIC_APM_SERVICE_NAME,
  serviceVersion: process.env.NUXT_PUBLIC_ELASTIC_APM_SERVICE_VERSION,
});

const env = runtimeConfig();

const config = Object.keys(defaults).reduce((memo, key) => {
  memo[key] = env[key] || defaults[key];
  return memo;
}, {});

if (config.serverUrl) {
  apm.start(config);
}

export default {};
