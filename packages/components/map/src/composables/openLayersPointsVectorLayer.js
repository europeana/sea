import { computed, ref, toRef, watchEffect } from "vue";

import Cluster from "ol/source/Cluster.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { boundingExtent } from "ol/extent.js";

export const useOpenLayersPointsVectorLayer = ({
  data,
  distance,
  minDistance,
  map,
  styleFeature,
} = {}) => {
  const mapRef = toRef(map);
  const layer = ref(null);
  const ready = ref(false);

  const features = computed(() =>
    (data.value?.features || []).map(
      (feature) =>
        new Feature({
          geometry: new Point(feature.geometry.coordinates),
          name: feature.id,
        }),
    ),
  );

  const createClusterSource = () =>
    new Cluster({
      distance,
      minDistance,
      source: new VectorSource({
        features: features.value,
      }),
    });

  const createSinglePointSource = () =>
    new VectorSource({
      features: features.value,
    });

  const createVectorLayer = () => {
    const source =
      features.value.length === 1
        ? createSinglePointSource()
        : createClusterSource();

    return new VectorLayer({
      source,
      style: styleFeature,
    });
  };

  const centreMapOnSinglePoint = () => {
    if (features.value.length === 1) {
      mapRef.value
        .getView()
        .setCenter(features.value[0].getGeometry().getCoordinates());
    }
  };

  const initLayer = () => {
    layer.value = createVectorLayer();
    mapRef.value.addLayer(layer.value);

    if (features.value.length === 1) {
      centreMapOnSinglePoint();
    } else if (features.value.length > 1) {
      mapRef.value?.on("click", handleClick);
    }

    ready.value = true;
  };

  const unwatchInitLayer = watchEffect(() => {
    if (mapRef.value && features.value.length > 0) {
      initLayer();
    }
  });

  watchEffect(() => {
    if (ready.value) {
      unwatchInitLayer();
    }
  });

  const zoomInOnCluster = (features) => {
    const extent = boundingExtent(
      features.map((r) => r.getGeometry().getCoordinates()),
    );
    mapRef.value
      .getView()
      .fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
  };

  function handleClick(e) {
    const clickedFeatures = mapRef.value.getFeaturesAtPixel(e.pixel);
    // Get clustered or single point feature(s)
    const features = clickedFeatures[0]?.get("features") || clickedFeatures;

    if (features?.length > 1) {
      zoomInOnCluster(features);
    }
  }

  return {
    layer: layer.value,
    source: layer.value?.getSource(),
  };
};
