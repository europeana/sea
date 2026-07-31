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
  source,
  navigatePinsButtonId,
  announcerId,
  pinSrLabel,
} = {}) => {
  const mapRef = toRef(map);
  const sourceRef = toRef(source);
  const focusSource = ref(new VectorSource());
  const focusedFeatureIndex = ref(-1);
  const currentlyVisibleFeatures = ref([]);

  const focusLayer = new VectorLayer({
    source: focusSource.value,
    style: new Style({
      image: new Circle({
        radius: 17,
        stroke: new Stroke({
          color: "blue",
          lineDash: [5, 10],
          width: 4,
        }),
      }),
    }),
    zIndex: 2,
  });

  const clearFocusFeature = () => {
    focusSource.value.clear();
    focusedFeatureIndex.value = -1;
    document.getElementById(announcerId).innerHTML = "";
  };

  const setFocus = (index) => {
    if (index > -1 && index < currentlyVisibleFeatures.value.length) {
      focusedFeatureIndex.value = index;
      const cluster = currentlyVisibleFeatures.value[index];
      const coordinates = cluster.getGeometry().getCoordinates();
      if (pinSrLabel) {
        if (cluster.get("features")?.length > 1) {
          document.getElementById(announcerId).innerHTML =
            `${pinSrLabel.multiple} ${cluster.get("features")?.length}`;
        } else {
          document.getElementById(announcerId).innerHTML = pinSrLabel.single;
        }
      }

      focusSource.value.clear();

      const focusFeature = new Feature({
        geometry: new Point(coordinates),
      });
      focusSource.value.addFeature(focusFeature);
    }
  };

  const setCurrentlyVisibleFeatures = () => {
    const extent = mapRef.value
      .getView()
      .calculateExtent(mapRef.value.getSize());
    const features = sourceRef.value.getFeatures();
    const visibleFeatures = features.filter((feature) => {
      return feature.getGeometry().intersectsExtent(extent);
    });

    // Sort left to right
    visibleFeatures.sort((a, b) => {
      const coordA = a.getGeometry().getCoordinates();
      const coordB = b.getGeometry().getCoordinates();

      return coordA[0] - coordB[0];
    });
    currentlyVisibleFeatures.value = visibleFeatures;
  };

  const isKeyWithInteraction = (key) => {
    return [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Enter",
      " ",
    ].includes(key);
  };

  const handleFocusOnKeyDown = (event) => {
    if (
      isKeyWithInteraction(event.key) &&
      currentlyVisibleFeatures.value.length > 0
    ) {
      if (["ArrowDown", "ArrowRight"].includes(event.key)) {
        const nextIndex = focusedFeatureIndex.value + 1;
        setFocus(nextIndex);
      }

      if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
        const previousIndex = focusedFeatureIndex.value - 1;
        setFocus(previousIndex);
      }

      // Simulate click event on Enter or Spacebar
      if (["Enter", " "].includes(event.key)) {
        if (focusedFeatureIndex.value > -1) {
          const focusedFeatureCoordinate = currentlyVisibleFeatures.value[
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
  };

  const initNavigatePinsControl = async () => {
    const navigatePinsButton = document.getElementById(navigatePinsButtonId);

    if (navigatePinsButton) {
      navigatePinsButton.addEventListener("keydown", handleFocusOnKeyDown);
      navigatePinsButton.addEventListener("blur", clearFocusFeature);

      const navigatePinsControl = new Control({
        element: navigatePinsButton,
      });
      mapRef.value.addControl(navigatePinsControl);
    }
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

  watch(
    sourceRef,
    () => {
      console.log("watch sourceRef");
      if (mapRef.value && sourceRef.value) {
        setCurrentlyVisibleFeatures();
        mapRef.value.on("moveend", setCurrentlyVisibleFeatures);
      }
    },
    {
      once: true,
    },
  );

  return {
    sourceRef,
    focusSource,
    focusedFeatureIndex,
    clearFocusFeature,
    setFocus,
    setCurrentlyVisibleFeatures,
    handleFocusOnKeyDown,
  };
};
