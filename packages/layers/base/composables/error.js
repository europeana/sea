import httpError from "http-errors";

// TODO: mv to utils?
export const createHttpError = (statusCode = 500, error = {}) => {
  return createError({
    statusCode,
    ...error,
    statusMessage: error.statusMessage || httpError(statusCode).message,
    fatal: true,
  });
};
