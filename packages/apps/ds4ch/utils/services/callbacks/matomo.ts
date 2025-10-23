export default function matomoCallback(consent: boolean) {
  const { matomo } = useMatomo();

  if (consent) {
    matomo.value?.rememberCookieConsentGiven();
  } else {
    matomo.value?.forgetCookieConsentGiven();
  }
}
