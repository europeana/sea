export default function useConsentManager() {
  const runtimeConfig = useRuntimeConfig();
  const COOKIE_CONSENT_KEY = "cookie-consent";
  const COOKIE_MAX_AGE = runtimeConfig.public.cookieConsent?.maxAge;

  // TODO define services
  const necessaryServices = ["auth"];
  const allServices = [...necessaryServices, "matomo", "youtube"];

  const getCookie = (name: string) => {
    const cookie = useCookie(name);

    return cookie.value || null;
  };

  const setCookie = (name: string, value: object, maxAge: number) => {
    const cookie = useCookie(name, { maxAge });
    cookie.value = value;
  };

  const saveConsent = (accepted: string[]) => {
    const value = { accepted };
    acceptedServices.value = accepted;

    setCookie(COOKIE_CONSENT_KEY, value, COOKIE_MAX_AGE);
  };

  const isServiceAccepted = (service: string) => {
    return acceptedServices.value.includes(service);
  };

  const acceptAll = () => {
    saveConsent([...allServices]);
  };

  const rejectAll = () => {
    saveConsent([...necessaryServices]);
  };

  const acceptOnly = (services: string[]) => {
    saveConsent([...necessaryServices, ...services]);
  };

  const acceptedServices = ref<string[]>([]);
  const consentRequired = ref<boolean>(true);

  // Get and store consent cookie on init
  const consent = getCookie(COOKIE_CONSENT_KEY);

  if (consent?.accepted?.length) {
    acceptedServices.value = consent.accepted;
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
