import { computed, watchEffect } from "vue";

import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
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
  const clusterStyle = (feature) => {
    const features = feature.get("features");
    const size = features.length;

    if (!clusterStyleCache[size]) {
      if (pointIconSrc && size === 1) {
        clusterStyleCache[size] = new Style({
          image: new Icon({
            src: pointIconSrc,
            width: 32,
            height: 32,
          }),
        });
      } else {
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
    }

    return clusterStyleCache[size];
  };

  const createClustersLayer = () => {
    return new VectorLayer({
      source: new Cluster({
        distance: Number.parseInt(40, 10),
        minDistance: Number.parseInt(20, 10),
        source: new VectorSource({
          features: features.value,
        }),
      }),
      style: clusterStyle,
    });
  };

  const centreMapOnSinglePoint = () => {
    if (data.value?.features?.length === 1) {
      map.value
        .getView()
        .setCenter(data.value.features[0].geometry.coordinates);
    }
  };

  watchEffect(() => {
    if (map.value && data.value) {
      map.value.addLayer(createClustersLayer());
      centreMapOnSinglePoint();
    }
  });
};
