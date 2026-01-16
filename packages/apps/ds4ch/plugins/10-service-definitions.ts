import { serviceDefinitionsPlugin } from "@europeana/sea-base-layer/composables/serviceDefinitions";
import { services } from "~/utils/services";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(serviceDefinitionsPlugin, { services });
});
