import apm from "elastic-apm-node";
import "dotenv/config";

apm.start({
  serverUrl: process.env.NUXT_PUBLIC_ELASTIC_APM_SERVER_URL,
  // TODO: should not have hard-coded default in base layer
  serviceName: "ds4ch",
  environment:
    process.env.NUXT_PUBLIC_ELASTIC_APM_ENVIRONMENT || process.env.NODE_ENV,
});
