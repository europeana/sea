import { ApmVuePlugin } from "@elastic/apm-rum-vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ApmVuePlugin, {
    router: useRouter(),
    config: useRuntimeConfig().public.elastic?.apm,
  });
});
