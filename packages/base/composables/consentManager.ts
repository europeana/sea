import { uniq } from "lodash-es";
import defu from "defu";

// Globally shared state
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

export function configureConsentManager(settings = {}) {
  config.value = defu(config.value, settings);
}

export function useConsentManager() {
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
    // TODO callbacks for services that need logic (matomo, hotjar)
  } else {
    acceptedServices.value = [...config.value.services.essential];
    checkedServices.value = [...config.value.services.essential];
    consentRequired.value = true;
  }

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
