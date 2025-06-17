import VueContentfulGraphql from "@europeana/vue-contentful-graphql";

// TODO: supply config to vue plugin
// TODO: capture errors to APM
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueContentfulGraphql);
});
