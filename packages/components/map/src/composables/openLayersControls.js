import { toRef, watch } from "vue";

import Attribution from "ol/control/Attribution.js";
import FullScreen from "ol/control/FullScreen.js";
import Zoom from "ol/control/Zoom.js";

export const useOpenLayersControls = ({ map, controls } = {}) => {
  const mapRef = toRef(map);
  const controlsRef = toRef(controls);

  function getMinZoomForViewport() {
    const viewport = mapRef.value.getTargetElement();
    const width = viewport?.clientWidth;
    const height = viewport?.clientHeight;

    if (width >= height) {
      return Math.LOG2E * Math.log(width / 256); // https://openlayers.org/en/latest/examples/min-zoom.html
    } else {
      return Math.LOG2E * Math.log(height / 256);
    }
  }

  const checkZoomAndDisableButton = (view) => {
    const maxZoom = view.getMaxZoom();
    const minZoomConfig = view.getMinZoom();
    const minZoomForViewport = getMinZoomForViewport();
    const minZoom = Math.max(minZoomConfig, minZoomForViewport);
    const currentZoom = view.getZoom();
    const nextMinZoom = currentZoom - 0.01;

    const zoomInButton = document.querySelector(".ol-zoom-in");
    const zoomOutButton = document.querySelector(".ol-zoom-out");

    if (zoomInButton) {
      if (currentZoom >= maxZoom) {
        zoomInButton.setAttribute("disabled", "true");
      } else {
        zoomInButton.removeAttribute("disabled");
      }
    }
    if (zoomOutButton) {
      if (nextMinZoom <= minZoom) {
        zoomOutButton?.setAttribute("disabled", "true");
      } else {
        zoomOutButton?.removeAttribute("disabled");
      }
    }
  };

  watch(
    mapRef,
    () => {
      if (mapRef.value) {
        if (controlsRef.value?.zoom) {
          mapRef.value.addControl(new Zoom({ ...controlsRef.value.zoom }));

          // Disable button when hitting min/max zoom
          const view = mapRef.value.getView();
          checkZoomAndDisableButton(view);
          view.on("change:resolution", () => checkZoomAndDisableButton(view));
        }
        if (controlsRef.value?.fullscreen) {
          mapRef.value.addControl(
            new FullScreen({ ...controlsRef.value.fullscreen }),
          );
        }
        mapRef.value.addControl(
          new Attribution({ ...controlsRef.value?.attribution }),
        );
      }
    },
    {
      immediate: true,
      once: true,
    },
  );
};
