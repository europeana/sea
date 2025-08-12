import VueMatomo from "vue-matomo";

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();
  const config = runtimeConfig.public.matomo;
  nuxtApp.vueApp.use(VueMatomo, {
    ...config,
    router: useRouter(),
  });
});
