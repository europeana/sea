import baseStyle from "./style.json" with { type: "json" };

const DEFAULT_LOCALE = "en";
// European languages supported by Europeana projects, where also supported by Protomaps
// @see https://docs.protomaps.com/basemaps/localization#list-of-supported-languages
export const LOCALES = new Set([
  "bg",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "es",
  "et",
  "eu",
  "fi",
  "fr",
  "ga",
  "hr",
  "hu",
  "it",
  "lt",
  "lv",
  "mt",
  "nl",
  "pl",
  "pt",
  "ro",
  "sk",
  "sl",
  "sv",
]);

export const localise = (locale) => {
  if (!LOCALES.has(locale)) {
    throw new Error(`Unsupported locale ${locale}`);
  }

  const style = JSON.parse(
    JSON.stringify(baseStyle).replaceAll(
      `"name:${DEFAULT_LOCALE}"`,
      `"name:${locale}"`,
    ),
  );

  return style;
};

export function* build() {
  for (const locale of LOCALES.values()) {
    yield {
      file: `europeana-map.style.protomaps.${locale}.json`,
      data: JSON.stringify(localise(locale)),
    };
  }
}
