import httpError from "http-errors";

export const createHttpError = (statusCode, error = {}) => {
  return createError({
    fatal: true,
    statusCode,
    ...error,
    statusMessage: error.statusMessage || httpError(statusCode).message,
  });
};
