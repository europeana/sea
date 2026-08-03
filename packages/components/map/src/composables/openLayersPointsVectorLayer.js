import { computed, ref, toRef, watchEffect } from "vue";
import { uniqWith, isEqual } from "lodash-es";

import Cluster from "ol/source/Cluster.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { boundingExtent } from "ol/extent.js";

export const useOpenLayersPointsVectorLayer = ({
  data,
  distance,
  spreadPinsAllowed,
  minDistance,
  map,
  styleFeature,
  spreadCluster,
} = {}) => {
  const mapRef = toRef(map);
  const clusterOrPinSource = ref(null);
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

  const createClustersLayer = () => {
    clusterOrPinSource.value = new Cluster({
      distance,
      minDistance,
      source: new VectorSource({
        features: features.value,
      }),
    });

    return new VectorLayer({
      source: clusterOrPinSource.value,
      style: styleFeature,
    });
  };

  const createSinglePointLayer = () => {
    clusterOrPinSource.value = new VectorSource({
      features: features.value,
    });

    return new VectorLayer({
      source: clusterOrPinSource.value,
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
    if (features.value.length === 1) {
      mapRef.value.addLayer(createSinglePointLayer());

      centreMapOnSinglePoint();
    } else {
      mapRef.value.addLayer(createClustersLayer());
    }

    if (features.value.length > 1) {
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
    const clickedFeatures = mapRef.value
      .getFeaturesAtPixel(e.pixel)
      .filter((feature) => feature.getGeometry() instanceof Point);
    // Get clustered or single point feature(s)
    const features = clickedFeatures[0]?.get("features") || clickedFeatures;

    if (features?.length > 1) {
      // only break clusters apart when allowed, and if all features are
      // at exactly the same co-ordinates
      if (
        spreadPinsAllowed() &&
        uniqWith(
          features.map((f) => f.getGeometry().getCoordinates()),
          isEqual,
        ).length === 1
      ) {
        spreadCluster(features);
      } else {
        zoomInOnCluster(features);
      }
    }
  }

  return { clusterOrPinSource };
};
