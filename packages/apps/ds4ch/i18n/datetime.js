import locales from "./locales";
const isoCodes = locales.map((locale) => locale.language);

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
};

export default isoCodes.reduce((memo, code) => {
  memo[code] = defaults;
  return memo;
}, {});
