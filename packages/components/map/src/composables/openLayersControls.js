import { computed, toRef, unref, watch } from "vue";

import Attribution from "ol/control/Attribution.js";
import FullScreen from "ol/control/FullScreen.js";
import Zoom from "ol/control/Zoom.js";

export const useOpenLayersControls = ({ map, controls, styleLabels } = {}) => {
  const mapRef = toRef(map);
  const controlsRef = computed(() =>
    styleControlLabels(unref(controls), unref(styleLabels)),
  );

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

// if any style properties are supplied, all supplied control labels (not tip labels)
// will be converted to span elements and have those style properties applied to them
//
// intended to be used where for some reason CSS rules do not get applied as desired
const styleControlLabels = (controls, styles) => {
  if (!controls || !styles) {
    return controls;
  }

  return Object.keys(controls).reduce((memo, controlKey) => {
    memo[controlKey] = {};

    for (const optionKey in controls[controlKey]) {
      memo[controlKey][optionKey] = controls[controlKey][optionKey];
      const optionKeyLowerCase = optionKey.toLowerCase();
      if (
        optionKeyLowerCase.includes("label") &&
        !optionKeyLowerCase.includes("tiplabel")
      ) {
        if (typeof memo[controlKey][optionKey] === "string") {
          // convert string to a span element
          const element = document.createElement("span");
          element.appendChild(
            document.createTextNode(memo[controlKey][optionKey]),
          );
          memo[controlKey][optionKey] = element;
        } else if (typeof memo[controlKey][optionKey] === "object") {
          if (memo[controlKey][optionKey].constructor.name === "Text") {
            // convert text node to a span element
            const element = document.createElement("span");
            element.appendChild(memo[controlKey][optionKey]);
            memo[controlKey][optionKey] = element;
          } else {
            // assume already an HTML element
          }
        }

        for (const styleProperty in styles) {
          memo[controlKey][optionKey].style.setProperty(
            styleProperty,
            styles[styleProperty],
          );
        }
      }
    }

    return memo;
  }, {});
};
