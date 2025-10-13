export default function useConsentManager(
  essentialServices: string[],
  allServices: string[],
) {
  const runtimeConfig = useRuntimeConfig();
  const COOKIE_CONSENT_KEY = "cookie-consent";
  const COOKIE_MAX_AGE =
    runtimeConfig.public.cookieConsent.maxAge || 60 * 60 * 24 * 15; // defaults to 15 days in seconds

  const getCookie = (name: string) => {
    const cookie = useCookie(name);

    return cookie.value || null;
  };

  const setCookie = (name: string, value: string[], maxAge: number) => {
    const cookie = useCookie(name, { maxAge });
    cookie.value = value.join();
  };

  const saveConsent = (accepted: string[]) => {
    acceptedServices.value = accepted;

    setCookie(COOKIE_CONSENT_KEY, accepted, COOKIE_MAX_AGE);
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

  const acceptedServices = ref<string[]>([]);
  const consentRequired = ref<boolean>(true);

  // Get and store consent cookie on init
  const consent = getCookie(COOKIE_CONSENT_KEY);

  if (consent?.split(",").length) {
    acceptedServices.value = consent.split(",");
    consentRequired.value = false;
    // TODO callbacks for services that need logic (matomo, hotjar)
  } else {
    consentRequired.value = true;
  }

  return {
    acceptAll,
    consentRequired,
    isServiceAccepted,
    rejectAll,
    acceptOnly,
  };
}
