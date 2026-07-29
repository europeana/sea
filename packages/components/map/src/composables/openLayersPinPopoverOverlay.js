import { ref, toRef, watch } from "vue";

import Overlay from "ol/Overlay.js";

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
