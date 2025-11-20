// TODO: consider moving to its own plugin pkg, vue-consent-manager

import { uniq } from "lodash-es";
import defu from "defu";

type ConsentCookie = Record<string, boolean>;

export function createConsentManager(settings = {}) {
  const acceptedServices = ref<string[]>([]);
  const consentRequired = ref<boolean>(true);
  const consentSaved = ref<boolean>(false);

  const config = ref<{
    key: string;
    maxAge: number;
    services: {
      all: string[];
      essential: string[];
      handleCallbacks?: (parameter: string[]) => void;
    };
  }>({
    key: "cookie-consent",
    maxAge: 60 * 60 * 24 * 15, // defaults to 15 days in seconds
    services: {
      all: [],
      essential: [],
    },
  });

  config.value = defu(settings, config.value);

  // TODO: consider simpler custom string encoding to remove multiple 'true'/'false' values.
  // "true=cloudflare,i18n;false=matomo,zoho"
  // useCookie handles decoding and encoding of the cookie value
  const consentCookie = useCookie<ConsentCookie>(config.value.key, {
    maxAge: config.value.maxAge,
  });

  const getCookie = (): ConsentCookie => {
    return consentCookie.value;
  };

  const setCookie = (value: ConsentCookie) => {
    consentCookie.value = value;
  };

  const saveConsent = (accepted: string[]) => {
    acceptedServices.value = uniq(accepted);

    const cookieValue: ConsentCookie = config.value.services.all.reduce(
      (memo, service) => {
        memo[service] = acceptedServices.value.includes(service);

        return memo;
      },
      {} as ConsentCookie,
    );

    setCookie(cookieValue);

    consentRequired.value = false;
    consentSaved.value = true;
  };

  const isServiceAccepted = (service: string) => {
    return acceptedServices.value.includes(service);
  };

  const acceptAll = () => {
    saveConsent([...config.value.services.all]);
  };

  const rejectAll = () => {
    saveConsent([...config.value.services.essential]);
  };

  const acceptOnly = (only: string[]) => {
    saveConsent([...config.value.services.essential, ...only]);
  };

  const getAndStoreConsent = () => {
    const consent = getCookie();

    if (consent) {
      const servicesWithConsent = Object.keys(consent).filter(
        (service) => !!consent[service],
      );
      acceptedServices.value = servicesWithConsent;
      consentSaved.value = true;
      // if there are no new services
      if (
        config.value.services.all.every((service: string) =>
          Object.keys(consent).includes(service),
        )
      ) {
        consentRequired.value = false;
      } else {
        consentRequired.value = true;
      }
    } else {
      consentSaved.value = false;
      acceptedServices.value = [...config.value.services.essential];
      consentRequired.value = true;
    }
  };

  // Get and store consent cookie on init
  getAndStoreConsent();

  watch(acceptedServices, (newVal) => {
    config.value.services.handleCallbacks?.(newVal);
    // TODO: Remove any other not accepted cookie
  });

  watch(
    () => consentCookie.value,
    () => getAndStoreConsent(),
  );

  return {
    acceptAll,
    acceptedServices,
    consentRequired,
    consentSaved,
    isServiceAccepted,
    rejectAll,
    acceptOnly,
  };
}

export const consentManagerPlugin = {
  install(app, config) {
    app.provide("consentManager", createConsentManager(config));
  },
};

export function useConsentManager() {
  return inject("consentManager");
}
