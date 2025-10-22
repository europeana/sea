import { configureConsentManagerServices } from "@europeana/sea-base-layer/composables/consentManager";
import {
  allServicesNames,
  essentialServicesNames,
} from "@/utils/services/services";

export default defineNuxtPlugin(() => {
  configureConsentManagerServices(essentialServicesNames, allServicesNames);
});
