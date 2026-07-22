import { ref, toRef, watch } from "vue";
import Circle from "ol/style/Circle.js";
import Control from "ol/control/Control.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

export const useOpenLayersKeyboardNavigation = ({
  map,
  clusterSource,
} = {}) => {
  // TODO: handle keyboard select for single point if/when actionable

  const mapRef = toRef(map);
  const focusSource = ref(new VectorSource());
  const focusedFeatureIndex = ref(-1);

  const focusLayer = new VectorLayer({
    source: focusSource.value,
    style: new Style({
      image: new Circle({
        radius: 17,
        stroke: new Stroke({
          // TODO use branded color?
          color: "blue",
          lineDash: [5, 10],
          width: 4,
        }),
      }),
    }),
    zIndex: 2,
  });

  const unsetFeatureFocus = () => {
    focusedFeatureIndex.value = -1;
  };

  const clearFocusFeature = () => {
    focusSource.value.clear();
    unsetFeatureFocus();
  };

  const setFocus = (cluster) => {
    const coordinates = cluster.getGeometry().getCoordinates();

    focusSource.value.clear();

    const focusFeature = new Feature({
      geometry: new Point(coordinates),
    });
    focusSource.value.addFeature(focusFeature);
  };

  // TODO: add/ trigger AT text on focus
  const handleFocusOnKeyDown = (event) => {
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Enter",
        " ",
      ].includes(event.key) &&
      clusterSource.value &&
      mapRef.value
    ) {
      // TODO: fetch extent and clusters once, not on each keydown
      const extent = mapRef.value
        .getView()
        .calculateExtent(mapRef.value.getSize());
      const visibleClusters = clusterSource.value
        .getFeatures()
        .filter((feature) => {
          return feature.getGeometry().intersectsExtent(extent);
        });

      if (visibleClusters.length > 0) {
        // Sort left to right
        visibleClusters.sort((a, b) => {
          const coordA = a.getGeometry().getCoordinates();
          const coordB = b.getGeometry().getCoordinates();

          return coordA[0] - coordB[0];
        });

        if (["ArrowDown", "ArrowRight"].includes(event.key)) {
          const nextIndex = focusedFeatureIndex.value + 1;
          if (nextIndex < visibleClusters.length) {
            focusedFeatureIndex.value = nextIndex;
            setFocus(visibleClusters[focusedFeatureIndex.value]);
          }
        }

        if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
          const previousIndex = focusedFeatureIndex.value - 1;
          if (previousIndex > -1) {
            focusedFeatureIndex.value = previousIndex;
            setFocus(visibleClusters[focusedFeatureIndex.value]);
          }
        }

        // Simulate click event on Enter or Spacebar
        if (["Enter", " "].includes(event.key)) {
          if (focusedFeatureIndex.value > -1) {
            const focusedFeatureCoordinate = visibleClusters[
              focusedFeatureIndex.value
            ]
              .getGeometry()
              .getCoordinates();
            const pixel = mapRef.value.getPixelFromCoordinate(
              focusedFeatureCoordinate,
            );

            const mockEvent = {
              type: "click",
              pixel: pixel,
            };

            mapRef.value.dispatchEvent(mockEvent);
          }
        }
      }
    }
  };

  const initNavigatePinsControl = () => {
    const element = document.getElementById("map-keyboard-focus-pin-toggle");
    element.addEventListener("keydown", handleFocusOnKeyDown);
    element.addEventListener("blur", clearFocusFeature);

    const navigatePinsControl = new Control({
      element,
    });
    mapRef.value.addControl(navigatePinsControl);
  };

  watch(
    mapRef,
    () => {
      if (mapRef.value) {
        initNavigatePinsControl();
        mapRef.value.addLayer(focusLayer);
        mapRef.value.on("pointerdown", clearFocusFeature);
        mapRef.value.getView().on("change:resolution", clearFocusFeature);
      }
    },
    {
      immediate: true,
      once: true,
    },
  );
};
