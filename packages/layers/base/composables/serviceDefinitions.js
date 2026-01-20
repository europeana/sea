import escapeRegExp from "lodash-es/escapeRegExp.js";
import { computed, readonly, ref } from "vue";

const services = ref([]);

const servicesWithSchemes = computed(() => {
  return services.value
    .filter((service) => service.schemes)
    .map((service) => ({
      ...service,
      schemeRegExps: service.schemes.map((scheme) => {
        const escaped = escapeRegExp(scheme).replace(/\\\*/g, ".+");
        return new RegExp(escaped);
      }),
    }));
});

const serviceSupportsUrl = (service, url) => {
  for (const schemeRegExp of service.schemeRegExps) {
    if (schemeRegExp.test(url)) {
      return true;
    }
  }

  return false;
};

const serviceForUrl = (url) =>
  servicesWithSchemes.value.find((service) =>
    serviceSupportsUrl(service, url),
  ) || null;

export const serviceDefinitionsPlugin = {
  install(app, config = {}) {
    services.value = config.services;
  },
};

export function useServiceDefinitions() {
  return {
    forUrl: serviceForUrl,
    services: readonly(services),
  };
}
