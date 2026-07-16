import { onMounted, toRef } from "vue";

import Attribution from "ol/control/Attribution.js";
import FullScreen from "ol/control/FullScreen.js";
import Zoom from "ol/control/Zoom.js";

export const useOpenLayersControls = ({ map, controls } = {}) => {
  const mapRef = toRef(map);
  const controlsRef = toRef(controls);

  const checkZoomAndDisableButton = (view) => {
    const maxZoom = view.getMaxZoom();
    const minZoomConfig = view.getMinZoom();
    const minZoomWorld = view.getZoomForResolution(
      view.getResolutionForExtent(view.getProjection().getWorldExtent()),
    );
    const minZoom = Math.max(minZoomConfig, minZoomWorld);
    const currentZoom = view.getZoom();
    const nextMinZoom = currentZoom - 1;

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

  onMounted(() => {
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

      mapRef.value.addControl(new Attribution());
    }
  });
};
