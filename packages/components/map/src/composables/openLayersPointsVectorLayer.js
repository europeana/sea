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
  const layer = ref(null);
  const source = ref(null);
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
    source.value =
      features.value.length === 1
        ? createSinglePointSource()
        : createClusterSource();

    return new VectorLayer({
      source: source.value,
      style: styleFeature,
    });
  };

  const centreMapOnSinglePoint = (coordinates) => {
    mapRef.value.getView().setCenter(coordinates);
  };

  const initLayer = () => {
    layer.value = createVectorLayer();
    mapRef.value.addLayer(layer.value);

    if (features.value.length === 1) {
      centreMapOnSinglePoint(features.value[0].getGeometry().getCoordinates());
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
    // padding is 10% of the longer side of the viewport
    const padding =
      Math.max(
        mapRef.value.getViewport().clientWidth,
        mapRef.value.getViewport().clientHeight,
      ) / 10;
    mapRef.value
      .getView()
      .fit(extent, {
        duration: 1000,
        padding: [padding, padding, padding, padding],
      });
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

  return {
    layer,
    source,
  };
};
