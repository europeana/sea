import protomapsStyle from "@/assets/style/protomaps.json" with { type: "json" };

export const useMapboxProtomapsStyle = ({ apiKey, locale = "en" } = {}) => {
  if (!apiKey) {
    throw new Error("protomaps style requires API key in apiKey option");
  }

  const style = JSON.parse(
    JSON.stringify(protomapsStyle).replace(/"name:en"/g, `"name:${locale}"`),
  );
  style.sources.protomaps.tiles[0] = `${style.sources.protomaps.tiles[0]}?key=${apiKey}`;

  return style;
};
