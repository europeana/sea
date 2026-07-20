import { computed, ref, toRef, watchEffect } from "vue";

import Cluster from "ol/source/Cluster.js";
import Feature from "ol/Feature.js";
import Overlay from "ol/Overlay.js";
import Point from "ol/geom/Point.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { boundingExtent } from "ol/extent.js";

export const useOpenLayersPointsVectorLayer = ({
  data,
  distance,
  minDistance,
  map,
  pinPopover,
  styleFeature,
} = {}) => {
  const mapRef = toRef(map);
  // TODO: split out popover to  separate composable?
  const popoverOverlay = ref(null);

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

  const createSinglePointLayer = () => {
    return new VectorLayer({
      source: new VectorSource({
        features: features.value,
      }),
      style: styleFeature,
    });
  };

  const createPopoverOverlay = () => {
    popoverOverlay.value = new Overlay({
      element:
        typeof pinPopover.value === "string"
          ? document.getElementById(pinPopover.value)
          : pinPopover.value,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });
    mapRef.value?.addOverlay(popoverOverlay.value);
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
      if (data.value?.features?.length === 1) {
        mapRef.value.addLayer(createSinglePointLayer());

        centreMapOnSinglePoint();
      } else {
        mapRef.value.addLayer(createClustersLayer());
      }

      if (pinPopover.value && !popoverOverlay.value) {
        createPopoverOverlay();
      }

      // Pins are clickable when there are clusters and/or popover
      if (data.value?.features?.length > 1 || pinPopover.value) {
        mapRef.value?.on("click", handleClick);
      }
    }
  });

  function handleClick(e) {
    const clickedFeatures = mapRef.value.getFeaturesAtPixel(e.pixel);
    // Get clustered or single point feature(s)
    const features = clickedFeatures[0]?.get("features") || clickedFeatures;

    // Show popover when single point
    if (features?.length === 1 && popoverOverlay.value) {
      const feature = features[0];
      const activeFeatureName = feature.get("name");

      // Dispatch custom event the parent app can listen too
      mapRef.value.dispatchEvent({
        type: "change:activefeature",
        activeFeatureName,
      });

      const coordinates = feature.getGeometry().getCoordinates();
      popoverOverlay.value.setPosition(coordinates);
    } else {
      // Hide popover when clicked anywhere else
      popoverOverlay.value?.setPosition(undefined);
    }

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
