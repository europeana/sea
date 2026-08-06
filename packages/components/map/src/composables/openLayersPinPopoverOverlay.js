import { ref, toRef, watch } from "vue";

import Overlay from "ol/Overlay.js";
import Point from "ol/geom/Point.js";

export const useOpenLayersPinPopoverOverlay = ({ map, pinPopover } = {}) => {
  const mapRef = toRef(map);
  const popoverOverlay = ref(null);

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
      // a11y: insert at position as loaded (after keyboard pin navigation control)
      insertFirst: false,
    });
    mapRef.value?.addOverlay(popoverOverlay.value);
  };

  function handleClick(e) {
    const clickedFeatures = mapRef.value
      .getFeaturesAtPixel(e.pixel)
      .filter((feature) => feature.getGeometry() instanceof Point);
    // Get clustered or single point feature(s)
    const features = clickedFeatures[0]?.get("features") || clickedFeatures;

    if (popoverOverlay.value) {
      // Show popover when single point
      // NOTE: a single feature may just be background, e.g. from a click on
      //       the sea, i.e. not necessarily a plotted point
      if (features?.length === 1) {
        const feature = features[0];
        const activeFeatureName = feature.get("name") || null;

        // Dispatch custom event the parent app can listen to

        mapRef.value.dispatchEvent({
          type: "change:activefeature",
          activeFeatureName,
        });

        if (activeFeatureName) {
          const coordinates = feature.getGeometry().getCoordinates();
          popoverOverlay.value.setPosition(coordinates);

          return;
        }
      }

      if (popoverOverlay.value.getPosition()) {
        mapRef.value.dispatchEvent({
          type: "change:activefeature",
          activeFeatureName: null,
        });

        // Hide popover when clicked anywhere else, or on a single point without
        // geometry, like the sea background
        popoverOverlay.value.setPosition(undefined);
      }
    }
  }

  watch(
    mapRef,
    () => {
      if (mapRef.value && pinPopover.value && !popoverOverlay.value) {
        createPopoverOverlay();

        mapRef.value?.on("click", handleClick);
      }
    },
    {
      immediate: true,
      once: true,
    },
  );
};
