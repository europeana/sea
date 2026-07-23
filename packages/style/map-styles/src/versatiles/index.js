import baseStyle from "./style.json" with { type: "json" };

// European languages supported by Europeana projects, where also supported by Versatiles
export const LOCALES = new Set([
  "de",
  "el",
  "en",
  "es",
  "fr",
  "it",
  "nl",
  "pl",
  "pt",
]);

export const localise = (locale) => {
  if (!LOCALES.has(locale)) {
    throw new Error(`Unsupported locale ${locale}`);
  }

  const style = {
    ...baseStyle,
    layers: baseStyle.layers.map((layer) => {
      if (layer.layout?.["text-field"]) {
        const textField = layer.layout?.["text-field"];
        if (
          textField.length === 2 &&
          textField[0] === "get" &&
          textField[1] === "name"
        ) {
          return {
            ...layer,
            layout: {
              ...layer.layout,
              "text-field": [
                "coalesce",
                ["get", `name_${locale}`],
                ["get", "name"],
              ],
            },
          };
        }
      }
      return layer;
    }),
  };

  return style;
};

export function* build() {
  yield {
    file: "europeana-map-styles.versatiles.json",
    data: baseStyle,
  };

  for (const locale of LOCALES.values()) {
    yield {
      file: `europeana-map-styles.versatiles.${locale}.json`,
      data: localise(locale),
    };
  }
}
