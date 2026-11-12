// TODO: typescript

// TODO: make this into its own pkg given that it will be used by other
//       apps too? or an optional extra (Nuxt) module of the
//       @europeana/vue-contentful-graphql pkg?

import VueContentfulGraphql from "@europeana/vue-contentful-graphql";

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();
  const config = runtimeConfig.public.contentful;
  nuxtApp.vueApp.use(VueContentfulGraphql, config);

  // TODO: wrap injected $contentful.query function to capture errors to Elastic
  //       APM, once APM is established
});
