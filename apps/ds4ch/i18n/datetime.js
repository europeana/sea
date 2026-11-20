import locales from "./locales.js";

const defaults = {
  numeric: {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  },
  short: {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  month: {
    month: "long",
    year: "numeric",
  },
};

export default locales.reduce((memo, locale) => {
  memo[locale.code] = defaults;
  return memo;
}, {});
