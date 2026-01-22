import apm from "elastic-apm-node";

export default defineNuxtPlugin(async (nuxtApp) => {
  console.log(
    "[elastic-apm.server Nuxt plugin]",
    apm.isStarted(),
    `${nuxtApp.ssrContext.event.method} ${useRoute().path}`,
  );

  if (!apm.isStarted()) {
    return;
  }

  // start a custom-named transaction on each SSR
  const transaction = apm.startTransaction(
    `${nuxtApp.ssrContext.event.method} ${useRoute().path}`,
    "page-load",
  );

  nuxtApp.hook("app:rendered", () => {
    transaction.end();
  });
});
