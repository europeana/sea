import { consentManagerPlugin } from "@europeana/sea-base-layer/composables/consentManager";
// TODO: call useServiceDefinitions to get service instead?
import { handleCallbacks, services } from "~/utils/services";

export default defineNuxtPlugin((nuxtApp) => {
  const essentialServicesNames = services
    .filter((s) => s.required)
    .map((s) => s.name);

  const allServicesNames = services.map((s) => s.name);

  nuxtApp.vueApp.use(consentManagerPlugin, {
    key: "ds4ch-cookie-consent",
    maxAge: useRuntimeConfig()?.public?.cookieConsent?.maxAge,
    services: {
      all: allServicesNames,
      essential: essentialServicesNames,
      handleCallbacks,
    },
  });
});
