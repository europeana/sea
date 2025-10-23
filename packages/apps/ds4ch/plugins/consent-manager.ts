import { configureConsentManager } from "@europeana/sea-base-layer/composables/consentManager";
import {
  allServicesNames,
  essentialServicesNames,
} from "@/utils/services/services";

export default defineNuxtPlugin(() => {
  configureConsentManager({
    maxAge: useRuntimeConfig()?.public?.cookieConsent?.maxAge,
    services: {
      all: allServicesNames,
      essential: essentialServicesNames,
    },
  });
});
