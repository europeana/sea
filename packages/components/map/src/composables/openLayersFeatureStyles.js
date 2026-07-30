import CircleStyle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Icon from "ol/style/Icon.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import Text from "ol/style/Text.js";

export const useOpenLayersFeatureStyles = ({ icon }) => {
  const styleCache = {};

  const getSingleFeatureStyleMinDimension = () => {
    if (icon) {
      return Math.min(icon.width, icon.height);
    } else {
      return getNumberedCircleStyle(1).getImage().radius * 2;
    }
  };

  const styleSingleFeature = () =>
    cachingStyle(1, () => {
      if (icon) {
        return new Style({
          image: new Icon(icon),
        });
      } else {
        return getNumberedCircleStyle(1);
      }
    });

  const cachingStyle = (key, generatorFn) => {
    if (!styleCache[key]) {
      styleCache[key] = generatorFn();
    }
    return styleCache[key];
  };

  const styleMultipleFeaturesSpread = (features) => {
    return new Style({
      image: new CircleStyle({
        radius: 3,
        stroke: new Stroke({
          color: "#000",
        }),
        fill: new Fill({
          color: "#000",
        }),
      }),
      geometry: features[0].getGeometry(),
    });
  };

  const getNumberedCircleStyle = (number) => {
    const radius = number >= 100 ? 16 : 12;
    return new Style({
      image: new CircleStyle({
        radius,
        stroke: new Stroke({
          color: "#000",
        }),
        fill: new Fill({
          color: "#000",
        }),
      }),
      text: new Text({
        text: number.toString(),
        fill: new Fill({
          color: "#fff",
        }),
        font: '700 0.875rem "Open Sans", "Arial", sans-serif',
      }),
    });
  };

  const styleMultipleFeaturesClustered = (features) =>
    cachingStyle(features.length, () =>
      getNumberedCircleStyle(features.length),
    );

  const styleMultipleFeatures = (features) => {
    if (features.every((feature) => feature.get("expanded"))) {
      return styleMultipleFeaturesSpread(features);
    } else {
      return styleMultipleFeaturesClustered(features);
    }
  };

  const styleFeature = (feature) => {
    const clusteredFeatures = feature.get("features");
    const size = clusteredFeatures?.length || 1;

    if (size === 1) {
      return styleSingleFeature();
    } else {
      return styleMultipleFeatures(clusteredFeatures);
    }
  };

  return {
    getSingleFeatureStyleMinDimension,
    styleFeature,
    styleSingleFeature,
  };
};
