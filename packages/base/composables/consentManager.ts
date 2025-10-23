import { uniq } from "lodash-es";

// Globally shared state
const acceptedServices = ref<string[]>([]);
const consentRequired = ref<boolean>(true);
const checkedServices = ref<string[]>([]);
const services = ref<{
  essential: string[];
  all: string[];
}>({
  essential: [],
  all: [],
});

export function configureConsentManagerServices(
  essential: string[],
  all: string[],
) {
  services.value = {
    essential,
    all,
  };
}

export function useConsentManager() {
  const runtimeConfig = useRuntimeConfig();
  const COOKIE_CONSENT_KEY = "cookie-consent";
  const COOKIE_MAX_AGE =
    runtimeConfig.public.cookieConsent.maxAge || 60 * 60 * 24 * 15; // defaults to 15 days in seconds

  // useCookie handles decoding and encoding of the cookie value
  const consentCookie = useCookie<string[]>(COOKIE_CONSENT_KEY, {
    maxAge: COOKIE_MAX_AGE,
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
    saveConsent([...services.value.all]);
  };

  const rejectAll = () => {
    saveConsent([...services.value.essential]);
  };

  const acceptOnly = (only: string[]) => {
    saveConsent([...services.value.essential, ...only]);
  };

  // Get and store consent cookie on init
  const consent = getCookie();

  if (consent?.length) {
    acceptedServices.value = [...consent];
    checkedServices.value = [...consent];
    consentRequired.value = false;
    // TODO callbacks for services that need logic (matomo, hotjar)
  } else {
    acceptedServices.value = [...services.value.essential];
    checkedServices.value = [...services.value.essential];
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
