import https from "node:https";
import { defineNitroPlugin } from "nitropack/runtime";

export default defineNitroPlugin(() => {
  // Prevent follow-redirects (used by axios in contentful-management)
  // from accumulating error listeners on reused keep-alive TLSSockets,
  // causing node to issue MaxListenersExceededWarning
  https.globalAgent = new https.Agent({ keepAlive: false });
});
