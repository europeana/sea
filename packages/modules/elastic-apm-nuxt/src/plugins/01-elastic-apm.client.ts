import { ApmVuePlugin } from "@elastic/apm-rum-vue";

// TODO: make part of the module

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ApmVuePlugin, {
    router: useRouter(),
    config: useRuntimeConfig().public.elastic?.apm,
  });
});
