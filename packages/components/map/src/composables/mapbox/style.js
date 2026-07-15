export const PROTOMAPS_STYLE_ID = "protomaps";
export const VERSATILES_STYLE_ID = "versatiles";
export const OPENSTREETMAP_STYLE_ID = "openstreetmap";
export const DEFAULT_STYLE_ID = OPENSTREETMAP_STYLE_ID;

export const useMapboxStyle = (
  styleId = DEFAULT_STYLE_ID,
  styleOptions = {},
) => {
  if (styleId === "protomaps") {
    return import("./protomapsStyle.js").then((module) =>
      module.useMapboxProtomapsStyle(styleOptions),
    );
  } else if (styleId === "versatiles") {
    return import("./versatilesStyle.js").then((module) =>
      module.useMapboxVersatilesStyle(styleOptions),
    );
  }

  return Promise.resolve(styleId);
};
