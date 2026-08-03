import { onMounted, toRef, unref, watch } from "vue";

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
  hash,
  map,
  style,
  zoom,
} = {}) => {
  // unref first in case it's a computed and we need to set it
  const centreRef = toRef(unref(centre) || centreOfEurope);
  const hashRef = toRef(hash);
  const elementIdRef = toRef(elementId);
  const mapRef = toRef(map);
  const styleRef = toRef(style);
  // unref first in case it's a computed and we need to set it
  const zoomRef = toRef(unref(zoom) || 4);

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

  // TODO: mv hash init/track to own composable
  const initFromHash = () => {
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const hashId = hashParams.get("em-id");
      if (hashId !== elementIdRef.value) {
        // there may be multiple maps on the page, but only 1 active & tracked via the URL hash
        return;
      }
      const hashCentre = hashParams.get("em-c");
      const hashZoom = hashParams.get("em-z");

      if (hashCentre) {
        centreRef.value = hashCentre.split(",").map(Number);
      }
      if (hashZoom) {
        zoomRef.value = Number(hashZoom);
      }
      if (hashCentre || hashZoom) {
        document.getElementById(elementIdRef.value)?.scrollIntoView();
      }
    }
  };

  const trackInHash = () => {
    const url = new URL(window.location);
    const hashCentre = mapRef.value.getView().getCenter().join(",");
    const hashZoom = mapRef.value.getView().getZoom();
    const hashParams = new URLSearchParams({
      "em-id": elementIdRef.value,
      "em-c": hashCentre,
      "em-z": hashZoom,
    }).toString();
    url.hash = `#${hashParams}`;
    window.location.replace(url);
  };

  const applyStyle = () =>
    mapRef.value?.setLayers([createLayer()].filter(Boolean));

  const initMap = () => {
    if (!mapRef.value) {
      mapRef.value = createOpenLayersMap(elementIdRef.value);
    }

    mapRef.value.setTarget(elementIdRef.value);
    mapRef.value.setView(createView());
    applyStyle();

    if (hashRef.value) {
      // prevent moveend callback firing during initial rendering which we don't want
      mapRef.value.once("loadend", () => {
        mapRef.value.on("moveend", trackInHash);
      });
    }
  };

  watch(styleRef, applyStyle, { immediate: true });

  onMounted(() => {
    if (hashRef.value) {
      initFromHash();
    }
    initMap();
  });

  return {
    map: mapRef,
  };
};
