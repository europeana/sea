export const createHttpError = (statusCode, error = {}) => {
  const { $i18n } = useNuxtApp();
  const { t, te } = $i18n;

  return createError({
    fatal: true,
    statusCode,
    statusMessage: te(`errors.http.${statusCode}`)
      ? t(`errors.http.${statusCode}`)
      : error.statusMessage,
    ...error,
  });
};
