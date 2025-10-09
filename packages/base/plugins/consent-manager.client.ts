export default defineNuxtPlugin(() => {
  const COOKIE_CONSENT_KEY = "cookie-consent";
  const COOKIE_MAX_AGE = 60 * 60 * 24 * 15; // 15 days in seconds

  // TODO define services
  const necessaryServices = ["auth"];
  const services = [...necessaryServices, "matomo", "youtube"];

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

    setCookie(COOKIE_CONSENT_KEY, value, COOKIE_MAX_AGE);
  };

  const isServiceAccepted = (service: string) => {
    return acceptedServices.value.includes(service);
  };

  const acceptAll = () => {
    acceptedServices.value = [...services];
    saveConsent(acceptedServices.value);
  };

  const rejectAll = () => {
    acceptedServices.value = [...necessaryServices];
    saveConsent(acceptedServices.value);
  };

  const savePreferences = (services: string[]) => {
    const selectedServices = [...necessaryServices, ...services];
    acceptedServices.value = selectedServices;
    saveConsent(selectedServices);
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
    provide: {
      consentManager: {
        acceptAll,
        consentRequired,
        isServiceAccepted,
        rejectAll,
        savePreferences,
      },
    },
  };
});
