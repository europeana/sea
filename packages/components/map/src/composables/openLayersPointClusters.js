import { computed, toRef, watchEffect } from "vue";

import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";

import VectorSource from "ol/source/Vector.js";
import Cluster from "ol/source/Cluster.js";
import VectorLayer from "ol/layer/Vector.js";
import { boundingExtent } from "ol/extent.js";

export const useOpenLayersPointClusters = ({
  data,
  distance,
  minDistance,
  map,
  styleFeature,
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

  const createClustersLayer = () => {
    const clustersLayer = new VectorLayer({
      source: new Cluster({
        distance,
        minDistance,
        source: new VectorSource({
          features: features.value,
        }),
      }),
      style: styleFeature,
    });
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

      mapRef.value?.on("click", handleClick);
    }
  });

  function handleClick(e) {
    const clickedFeatures = mapRef.value.getFeaturesAtPixel(e.pixel);
    const features = clickedFeatures[0]?.get("features");

    if (features?.length > 1) {
      const extent = boundingExtent(
        features.map((r) => r.getGeometry().getCoordinates()),
      );
      mapRef.value
        .getView()
        .fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
    }
  }
};
