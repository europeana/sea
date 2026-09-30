import VueMatomo from "vue-matomo";

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();
  const config = runtimeConfig.public.matomo;
  if (config?.host && config?.siteId) {
    nuxtApp.vueApp.use(VueMatomo, {
      ...config,
      router: useRouter(),
      requireCookieConsent: true,
    });
  } else {
    console.warn("Matomo host/site not configured.");
  }
});
