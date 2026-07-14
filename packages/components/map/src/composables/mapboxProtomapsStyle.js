import protomapsStyle from "@/assets/style/protomaps.json" with { type: "json" };

const DEFAULT_LOCALE = "en";
// @see https://docs.protomaps.com/basemaps/localization#list-of-supported-languages
const SUPPORTED_LOCALES = new Set([
  "ar",
  "bg",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "es",
  "et",
  "fa",
  "fi",
  "fr",
  "ga",
  "he",
  "hi",
  "hr",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "lt",
  "lv",
  "mr",
  "mt",
  "ne",
  "nl",
  "no",
  "pl",
  "pt",
  "ro",
  "ru",
  "sk",
  "sl",
  "sv",
  "tr",
  "uk",
  "ur",
  "vi",
  "zh-Hans",
  "zh-Hant",
]);

export const useMapboxProtomapsStyle = ({
  apiKey,
  locale = DEFAULT_LOCALE,
} = {}) => {
  if (!apiKey) {
    throw new Error("protomaps style requires API key in apiKey option");
  }

  if (!SUPPORTED_LOCALES.has(locale)) {
    locale = DEFAULT_LOCALE;
  }

  const style = JSON.parse(
    JSON.stringify(protomapsStyle).replace(/"name:en"/g, `"name:${locale}"`),
  );
  const url = new URL(style.sources.protomaps.tiles[0]);
  url.searchParams.set("key", apiKey);
  style.sources.protomaps.tiles[0] = url.toString();

  return style;
};
