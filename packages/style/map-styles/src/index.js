import {
  LOCALES as PROTOMAPS_LOCALES,
  FALLBACK_LOCALE as PROTOMAPS_FALLBACK_LOCALE,
} from "./styles/protomaps/index.js";
import {
  LOCALES as VERSATILES_LOCALES,
  FALLBACK_LOCALE as VERSATILES_FALLBACK_LOCALE,
} from "./styles/versatiles/index.js";

export const EUROPEANA_MAP_STYLE_NAMES = ["protomaps", "versatiles"];
const LOCALES = {
  protomaps: PROTOMAPS_LOCALES,
  versatiles: VERSATILES_LOCALES,
};
const FALLBACK_LOCALE = {
  protomaps: PROTOMAPS_FALLBACK_LOCALE,
  versatiles: VERSATILES_FALLBACK_LOCALE,
};

// TODO: some of this should be shared w/ tasks.js
const EUROPEANA_MAP_STYLES_PACKAGE_NAME = "@europeana/map-styles";
const EUROPEANA_MAP_STYLES_DIR_NAME = "dist";
const EUROPEANA_MAP_STYLES_FILE_NAME = "europeana-map-styles";
const EUROPEANA_MAP_STYLES_FILE_EXTENSION = "json";
const JSDELIVR_CDN_BASE_URL = "https://cdn.jsdelivr.net/npm";

// TODO: this needs to be imported into portal.js and called from there
// generates a CDN URL for a customised Europeana map style
export const useEuropeanaMapStyle = (
  styleName,
  { baseURL, locale, version } = {},
) => {
  if (!EUROPEANA_MAP_STYLE_NAMES.includes(styleName)) {
    throw new Error(
      `Invalid style name: ${styleName}. Supported styles: ${EUROPEANA_MAP_STYLE_NAMES}`,
    );
  }

  if (!LOCALES[styleName].has(locale)) {
    locale = FALLBACK_LOCALE[styleName];
  }

  let url = baseURL || JSDELIVR_CDN_BASE_URL;

  url = `${url}/${EUROPEANA_MAP_STYLES_PACKAGE_NAME}`;

  if (version) {
    url = `${url}@${version}`;
  }

  url = `${url}/${EUROPEANA_MAP_STYLES_DIR_NAME}/${styleName}/${EUROPEANA_MAP_STYLES_FILE_NAME}.${styleName}`;

  if (locale) {
    url = `${url}.${locale}`;
  }

  url = `${url}.${EUROPEANA_MAP_STYLES_FILE_EXTENSION}`;

  return url;
};
