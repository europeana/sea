import { consentManagerPlugin } from "@europeana/sea-base-layer/composables/consentManager";
import {
  allServicesNames,
  essentialServicesNames,
} from "@/utils/services/services";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(consentManagerPlugin, {
    maxAge: useRuntimeConfig()?.public?.cookieConsent?.maxAge,
    services: {
      all: allServicesNames,
      essential: essentialServicesNames,
    },
  });
});
