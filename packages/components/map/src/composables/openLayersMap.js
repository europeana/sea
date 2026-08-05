import { onMounted, toRef, watch } from "vue";

import Map from "ol/Map.js";
import View from "ol/View.js";
import { defaults as defaultInteractions } from "ol/interaction/defaults.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import { useGeographic } from "ol/proj.js";
import { apply as applyMapboxStyle } from "ol-mapbox-style";
import LayerGroup from "ol/layer/Group.js";

import { elementIdFor } from "@/utils/elementIdFor.js";

const projection = "EPSG:3857";
const centreOfEurope = [9.254419, 50.102223];

export const createOpenLayersMap = (elementId) => {
  return new Map({
    controls: [],
    interactions: defaultInteractions({
      altShiftDragRotate: false,
      pinchRotate: false,
    }),
    keyboardEventTarget: elementIdFor(elementId, "keyboardEventTarget"),
  });
};

export const useOpenLayersMap = ({
  centre,
  elementId,
  map,
  style,
  zoom,
} = {}) => {
  const centreRef = toRef(centre);
  const elementIdRef = toRef(elementId);
  const mapRef = toRef(map);
  const styleRef = toRef(style);
  const zoomRef = toRef(zoom);

  if (!centreRef.value) {
    centreRef.value = centreOfEurope;
  }
  if (!zoomRef.value) {
    zoomRef.value = 4;
  }

  // use Geographic projection for correct position of geo coordinates
  useGeographic();

  const createLayer = () => {
    if (!styleRef.value || styleRef.value === "openstreetmap") {
      return new TileLayer({ source: new OSM() });
    } else {
      const layerGroup = new LayerGroup();
      applyMapboxStyle(layerGroup, styleRef.value);
      return layerGroup;
    }
  };

  const createView = () => {
    return new View({
      center: centreRef.value,
      minZoom: 1,
      maxZoom: 20,
      projection,
      zoom: zoomRef.value,
    });
  };

  const applyStyle = () =>
    mapRef.value?.setLayers([createLayer()].filter(Boolean));

  const initMap = () => {
    if (!mapRef.value) {
      mapRef.value = createOpenLayersMap(elementIdRef.value);
    }

    mapRef.value.setTarget(elementIdRef.value);
    mapRef.value.setView(createView());
    registerMapEventHandler();
    applyStyle();
  };

  watch(styleRef, applyStyle, { immediate: true });

  const updateRefsFromMapView = () => {
    centreRef.value = mapRef.value.getView().getCenter();
    zoomRef.value = mapRef.value.getView().getZoom();
  };

  const registerMapEventHandler = () => {
    // prevent moveend callback firing during initial rendering which we don't want
    mapRef.value.once("loadend", () => {
      mapRef.value.on("moveend", () => {
        updateRefsFromMapView();
      });
    });
  };

  onMounted(() => {
    initMap();
  });

  return {
    map: mapRef,
  };
};
