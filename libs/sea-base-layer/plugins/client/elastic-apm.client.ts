import { ApmVuePlugin } from "@elastic/apm-rum-vue";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.elastic?.apm;

  if (config.serverUrl) {
    nuxtApp.vueApp.use(ApmVuePlugin, {
      router: useRouter(),
      config: useRuntimeConfig().public.elastic?.apm,
    });
  } else {
    console.warn("Elastic APM server URL not configured.");
  }
});
