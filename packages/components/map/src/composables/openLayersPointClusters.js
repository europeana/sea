import { computed, toRef, watchEffect } from "vue";
// TODO: add to pkg deps
import { uniqWith, isEqual } from "lodash-es";

import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import LineString from "ol/geom/LineString.js";
import VectorSource from "ol/source/Vector.js";
import Cluster from "ol/source/Cluster.js";
import VectorLayer from "ol/layer/Vector.js";
import CircleStyle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Icon from "ol/style/Icon.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import Text from "ol/style/Text.js";

export const useOpenLayersPointClusters = ({
  data,
  map,
  pointIconSrc,
} = {}) => {
  const mapRef = toRef(map);

  const features = computed(() =>
    data.value.features.map(
      (feature) =>
        new Feature({
          geometry: new Point(feature.geometry.coordinates),
          name: feature.id,
        }),
    ),
  );

  const clusterStyleCache = {};
  if (pointIconSrc) {
    clusterStyleCache[1] = new Style({
      image: new Icon({
        src: pointIconSrc,
        width: 32,
        height: 32,
      }),
    });
  }

  function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  const clusterStyle = (feature) => {
    const features = feature.get("features");
    const size = features?.length || 0;
    const zoom = mapRef.value.getView().getZoom();

    // only break clusters apart at zoom level 16+, and if all features are
    // at exactly the same co-ordinates
    if (
      zoom >= 16 &&
      size >= 2 &&
      uniqWith(
        features.map((f) => f.getGeometry().getCoordinates()),
        isEqual,
      ).length === 1
    ) {
      const coords = features.map((f) => f.getGeometry().getCoordinates());
      console.log("clustered close coords", coords);
      const styles = features
        .map((feature, index) => {
          const pointGeometry = feature.getGeometry().clone();
          const pointStyle = clusterStyleCache[1].clone();

          const distance = 24; // pixels
          const deltaAngle = (degreesToRadians(360) / size) * index;
          const displacementX = distance * Math.sin(deltaAngle);
          const displacementY = distance * Math.cos(deltaAngle);

          const originalCoordinates = pointGeometry.getCoordinates();
          const originalPixel =
            mapRef.value.getPixelFromCoordinate(originalCoordinates);
          const newPixel = [
            originalPixel[0] + displacementX,
            originalPixel[1] + displacementY,
          ];
          const newCoordinates = mapRef.value.getCoordinateFromPixel(newPixel);

          pointGeometry.setCoordinates(newCoordinates);
          pointStyle.setGeometry(pointGeometry);

          const lineStyle = new Style({
            geometry: new LineString([originalCoordinates, newCoordinates]),
            stroke: new Stroke({
              color: "#000",
              width: 2,
            }),
          });

          const circleStyle = new Style({
            image: new CircleStyle({
              radius: 4,
              stroke: new Stroke({
                color: "#000",
              }),
              fill: new Fill({
                color: "#000",
              }),
            }),
            geometry: feature.getGeometry(),
          });

          return [pointStyle, lineStyle, circleStyle];
        })
        .flat();

      return styles;
    }

    if (!clusterStyleCache[size]) {
      clusterStyleCache[size] = new Style({
        image: new CircleStyle({
          radius: 14,
          stroke: new Stroke({
            color: "#000",
          }),
          fill: new Fill({
            color: "#000",
          }),
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: "#fff",
          }),
          font: '700 0.875rem "Open Sans", "Arial", sans-serif',
        }),
      });
    }

    return clusterStyleCache[size];
  };

  const createClustersLayer = () => {
    const clustersLayer = new VectorLayer({
      source: new Cluster({
        distance: 32,
        minDistance: 32,
        source: new VectorSource({
          features: features.value,
        }),
      }),
      style: clusterStyle,
    });
    console.log("clustersLayer properties", clustersLayer.getProperties());
    return clustersLayer;
  };

  const centreMapOnSinglePoint = () => {
    if (data.value?.features?.length === 1) {
      mapRef.value
        .getView()
        .setCenter(data.value.features[0].geometry.coordinates);
    }
  };

  watchEffect(() => {
    if (mapRef.value && data.value) {
      // TODO: do not use clusters if only one feature
      mapRef.value.addLayer(createClustersLayer());
      centreMapOnSinglePoint();
    }
  });
};
