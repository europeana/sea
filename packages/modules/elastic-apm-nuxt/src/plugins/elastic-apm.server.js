import apm from "elastic-apm-node";

export default defineNuxtPlugin(async (nuxtApp) => {
  if (!apm.isStarted()) {
    return;
  }

  // start a custom-named transaction on each SSR
  // TODO: optionally (by config) symbolify locale in path as /:locale
  const transaction = apm.startTransaction(
    `${nuxtApp.ssrContext.event.method} ${useRoute().path}`,
    "page-load",
  );

  nuxtApp.hook("app:rendered", () => {
    transaction.end();
  });
});
