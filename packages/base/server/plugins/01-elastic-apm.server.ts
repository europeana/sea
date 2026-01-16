import apm from "elastic-apm-node";

export default defineNitroPlugin(async () => {
  // as a Nitro plugin, this only runs once, when the server-side app
  // starts up, early in the lifecycle

  console.log("[elastic-apm.server Nitro plugin]");

  if (!apm.isStarted()) {
    console.log("starting apm on server");
    // TODO: try moving this to nitro plugin?
    await apm.start(useRuntimeConfig().public.elastic?.apm);

    await import("http");
    await import("http2");
    await import("https");
  }

  // nitroApp.hook('app:created', () => {
  //   console.log('[elastic-apm.server Nuxt plugin] app:created')
  // })

  // nitroApp.hook('vue:setup', () => {
  //   console.log('[elastic-apm.server Nuxt plugin] vue:setup')
  // })
});
