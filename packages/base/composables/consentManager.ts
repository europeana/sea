import { uniq } from "lodash-es";

// Globally shared state
const acceptedServices = ref<string[]>([]);
const consentRequired = ref<boolean>(true);
const checkedServices = ref<string[]>([]);

export default function useConsentManager(
  essentialServices: string[],
  allServices: string[],
) {
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
    checkedServices.value = [...essentialServices];
  };

  const isServiceAccepted = (service: string) => {
    return acceptedServices.value.includes(service);
  };

  const acceptAll = () => {
    saveConsent([...allServices]);
  };

  const rejectAll = () => {
    saveConsent([...essentialServices]);
  };

  const acceptOnly = (services: string[]) => {
    saveConsent([...essentialServices, ...services]);
  };

  // Get and store consent cookie on init
  const consent = getCookie();

  if (consent?.length) {
    acceptedServices.value = [...consent];
    checkedServices.value = [...consent];
    consentRequired.value = false;
    // TODO callbacks for services that need logic (matomo, hotjar)
  } else {
    checkedServices.value = [...essentialServices];
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
