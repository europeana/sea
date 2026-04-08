import { ApmVuePlugin } from "@elastic/apm-rum-vue";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.elasticApm;

  if (config.serverUrl) {
    nuxtApp.vueApp.use(ApmVuePlugin, {
      router: useRouter(),
      config,
    });
  }
});
