// TODO: consider moving to its own plugin pkg, vue-consent-manager

import { uniq } from "lodash-es";
import defu from "defu";

export function createConsentManager(settings = {}) {
  const { matomo } = useMatomo();
  const acceptedServices = ref<string[]>([]);
  const consentRequired = ref<boolean>(true);
  const checkedServices = ref<string[]>([]);

  const config = ref<{
    key: string;
    maxAge: number;
    services: {
      all: string[];
      essential: string[];
    };
  }>({
    key: "cookie-consent",
    maxAge: 60 * 60 * 24 * 15, // defaults to 15 days in seconds
    services: {
      all: [],
      essential: [],
    },
  });

  config.value = defu(config.value, settings);

  // useCookie handles decoding and encoding of the cookie value
  const consentCookie = useCookie<string[]>(config.value.key, {
    maxAge: config.value.maxAge,
  });

  const getCookie = () => {
    return consentCookie.value;
  };

  const setCookie = (value: string[] = []) => {
    consentCookie.value = value;
  };

  const saveConsent = (accepted: string[]) => {
    acceptedServices.value = uniq(accepted);

    setCookie(uniq(accepted));

    checkedServices.value = [...acceptedServices.value];
    consentRequired.value = false;
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

  // Get and store consent cookie on init
  const consent = getCookie();

  if (consent?.length) {
    acceptedServices.value = [...consent];
    checkedServices.value = [...consent];
    consentRequired.value = false;
  } else {
    acceptedServices.value = [...config.value.services.essential];
    checkedServices.value = [...config.value.services.essential];
    consentRequired.value = true;
  }

  watch(acceptedServices, (newVal) => {
    if (newVal.includes("matomo")) {
      matomo.value?.rememberCookieConsentGiven();
    } else {
      matomo.value?.forgetCookieConsentGiven();
    }
    // TODO: Remove any other not accepted cookie
  });

  return {
    acceptAll,
    acceptedServices,
    checkedServices,
    consentRequired,
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
