export default function useCanonicalUrl() {
  const route = useRoute();
  const appConfig = useRuntimeConfig().public;
  const { locale } = useI18n();

  const urlWithBothLocaleAndQuery = ref(null);
  const urlWithOnlyQuery = ref(null);
  const urlWithOnlyLocale = ref(null);
  const urlWithNeitherLocaleNorQuery = ref(null);

  const pathToUrl = (path) => {
    return `${appConfig.baseUrl}${path}`;
  };

  const pathWithoutLocale = (path) => {
    if (route.path === `/${locale.value}`) {
      return path.replace(`/${locale.value}`, "");
    } else if (path.startsWith(`/${locale.value}/`)) {
      return path.slice(3);
    }
    return path;
  };

  const setCanonicalUrl = () => {
    urlWithBothLocaleAndQuery.value = pathToUrl(route.fullPath);
    urlWithOnlyQuery.value = pathToUrl(pathWithoutLocale(route.fullPath));
    urlWithOnlyLocale.value = pathToUrl(route.path);
    urlWithNeitherLocaleNorQuery.value = pathToUrl(
      pathWithoutLocale(route.path),
    );
  };

  setCanonicalUrl();
  watch(() => route.fullPath, setCanonicalUrl);

  return {
    urlWithBothLocaleAndQuery,
    urlWithOnlyQuery,
    urlWithOnlyLocale,
    urlWithNeitherLocaleNorQuery,
  };
}
