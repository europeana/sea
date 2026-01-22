import apm from "elastic-apm-node";

// TODO: make part of the module

export default defineNuxtPlugin(async (nuxtApp) => {
  // if (!apm.isStarted()) {
  //   console.log('starting apm on server')
  //   // TODO: try moving this to nitro plugin?
  //   await apm.start(useRuntimeConfig().public.elastic?.apm)

  //   await import('http');
  //   await import('http2');
  //   await import('https');
  // }

  console.log(
    "[elastic-apm.server Nuxt plugin]",
    `${nuxtApp.ssrContext.event.method} ${useRoute().path}`,
  );

  // start a transaction because elastic-apm-node doesn't appear to do so
  // automatically on receiving http requests
  const transaction = apm.startTransaction(
    `${nuxtApp.ssrContext.event.method} ${useRoute().path}`,
    "page-load",
  );

  // console.log('nuxtApp.ssrContext.event', nuxtApp.ssrContext.event.method)
  // apm.setTransactionName(`${nuxtApp.ssrContext.event.method} ${useRoute().path}`);

  nuxtApp.hook("app:rendered", () => {
    // console.log('[elastic-apm.server Nuxt plugin] app:rendered')
    transaction.end();
  });

  // nuxtApp.hook('vue:setup', () => {
  //   console.log('[elastic-apm.server Nuxt plugin] vue:setup')
  // })
});
