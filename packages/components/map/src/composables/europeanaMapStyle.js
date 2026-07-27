const EUROPEANA_MAP_STYLES_PACKAGE_NAME = "@europeana/map-styles";
const EUROPEANA_MAP_STYLES_DIR_NAME = "dist";
const EUROPEANA_MAP_STYLES_FILE_NAME = "europeana-map-styles";
const EUROPEANA_MAP_STYLES_FILE_EXTENSION = "json";
const JSDELIVR_CDN_BASE_URL = "https://cdn.jsdelivr.net/npm";

export const EUROPEANA_MAP_STYLE_NAMES = ["protomaps", "versatiles"];

export const useEuropeanaMapStyle = (
  styleName,
  { baseURL, locale, version } = {},
) => {
  if (!EUROPEANA_MAP_STYLE_NAMES.includes(styleName)) {
    throw new Error(
      `Invalid style name: ${styleName}. Supported styles: ${EUROPEANA_MAP_STYLE_NAMES}`,
    );
  }
  let url = baseURL || JSDELIVR_CDN_BASE_URL;

  url = `${url}/${EUROPEANA_MAP_STYLES_PACKAGE_NAME}`;

  if (version) {
    url = `${url}@${version}`;
  }

  url = `${url}/${EUROPEANA_MAP_STYLES_DIR_NAME}/${styleName}/${EUROPEANA_MAP_STYLES_FILE_NAME}.${styleName}`;

  // TODO: validate supported locale; if not, then what?
  // TODO: validate locale supplied if native lang not available, e.g. protomaps
  if (locale) {
    url = `${url}.${locale}`;
  }

  url = `${url}.${EUROPEANA_MAP_STYLES_FILE_EXTENSION}`;

  return url;
};
