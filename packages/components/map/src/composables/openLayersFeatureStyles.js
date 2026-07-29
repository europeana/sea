import { toRef } from "vue";
import { uniqWith, isEqual } from "lodash-es";

import CircleStyle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Icon from "ol/style/Icon.js";
import LineString from "ol/geom/LineString.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import Text from "ol/style/Text.js";

export const useOpenLayersFeatureStyles = ({ icon, map }) => {
  const mapRef = toRef(map);
  const styleCache = {};

  const degreesToRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };

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

  const getNewCoordinates = (geometry, distance, angle) => {
    const originalCoordinates = geometry.getCoordinates();
    const originalPixel =
      mapRef.value.getPixelFromCoordinate(originalCoordinates);

    const displacementX = distance * Math.sin(angle);
    const displacementY = distance * Math.cos(angle);

    const newPixel = [
      originalPixel[0] + displacementX,
      originalPixel[1] + displacementY,
    ];
    return mapRef.value.getCoordinateFromPixel(newPixel);
  };

  const moveGeometry = (geometry, distance, angle) => {
    const newCoordinates = getNewCoordinates(geometry, distance, angle);

    geometry.setCoordinates(newCoordinates);
  };

  // for each spread feature, draw a point marker, and a line from it to the original coordinate
  const styleSpreadFeature = (feature) => {
    const originalGeometry = feature.getProperties().originalGeometry;
    const newCoordinates = feature.getGeometry().getCoordinates();
    const styles = [
      // put a small circle at the original co-ordinates, i.e. at the centre
      // of the spokes
      new Style({
        image: new CircleStyle({
          radius: 3,
          stroke: new Stroke({
            color: "#000",
          }),
          fill: new Fill({
            color: "#000",
          }),
        }),
        geometry: originalGeometry,
      }),
    ];

    const pointStyle = styleSingleFeature().clone();
    styles.push(pointStyle);
    const originalCoordinates = originalGeometry.getCoordinates();
    const lineStyle = new Style({
      geometry: new LineString([originalCoordinates, newCoordinates]),
      stroke: new Stroke({
        color: "#000",
        width: 1,
      }),
    });
    styles.push(lineStyle);

    return styles;
  };
  // spread multiple features at the same co-ordinates as spokes coming from
  // a dot at the centre point (the original co-ordinates) to a marker for
  // each of the features moved away from the centre in a different direction
  const spreadMultipleFeatures = (features) => {
    const distance = getSingleFeatureStyleMinDimension() * 1.5; // in pixels
    const unitAngle = degreesToRadians(360) / features.length;

    features.forEach((feature, index) => {
      const angle = unitAngle * index;
      const pointGeometry = feature.getGeometry();
      const originalGeometry = pointGeometry.clone();
      // Moves the actual feature geometry
      moveGeometry(pointGeometry, distance, angle);

      // Store the original geometry to distinguish spread features, and use it for the centre point and spokes style
      if (!feature.getProperties().originalGeometry) {
        feature.setProperties({ originalGeometry: originalGeometry }, true);
      }
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
    const zoom = mapRef.value.getView().getZoom();

    // only break clusters apart at zoom level 19+, and if all features are
    // at exactly the same co-ordinates
    if (
      zoom >= 19 &&
      features.length >= 2 &&
      uniqWith(
        features.map((f) => f.getGeometry().getCoordinates()),
        isEqual,
      ).length === 1
    ) {
      return spreadMultipleFeatures(features);
    } else {
      return styleMultipleFeaturesClustered(features);
    }
  };

  const styleFeature = (feature) => {
    const clusteredFeatures = feature.get("features");
    const size = clusteredFeatures?.length || 1;

    if (size === 1) {
      // set style spread feature
      if (clusteredFeatures[0].getProperties().originalGeometry) {
        return styleSpreadFeature(clusteredFeatures[0]);
      }
      return styleSingleFeature();
    } else {
      return styleMultipleFeatures(clusteredFeatures);
    }
  };

  return { getSingleFeatureStyleMinDimension, styleFeature };
};
