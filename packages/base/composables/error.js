const createHttpError = (statusCode, error = {}) => {
  const { t } = useI18n();

  return createError({
    fatal: true,
    statusCode,
    statusMessage: t(`errors.http.${statusCode}`),
    ...error,
  });
};

export const createHttp404Error = (error = {}) => createHttpError(404, error);
