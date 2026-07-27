import { onMounted, toRef, unref, watch } from "vue";

import Map from "ol/Map.js";
import View from "ol/View.js";

import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import { useGeographic } from "ol/proj.js";
import { apply as applyMapboxStyle } from "ol-mapbox-style";
import LayerGroup from "ol/layer/Group.js";

import {
  EUROPEANA_MAP_STYLE_NAMES,
  useEuropeanaMapStyle,
} from "./europeanaMapStyle.js";

const projection = "EPSG:3857";
const centreOfEurope = [9.254419, 50.102223];

export const useOpenLayersMap = ({
  centre,
  hash,
  map,
  style,
  target,
  zoom,
} = {}) => {
  // unref first in case it's a computed and we need to set it
  const centreRef = toRef(unref(centre) || centreOfEurope);
  const hashRef = toRef(hash);
  const mapRef = toRef(map);
  const styleRef = toRef(style || "openstreetmap");
  const targetRef = toRef(target);
  // unref first in case it's a computed and we need to set it
  const zoomRef = toRef(unref(zoom) || 4);

  // use Geographic projection for correct position of geo coordinates
  useGeographic();

  const createLayer = () => {
    let styleNameOrURL;
    let styleOptions;
    let styleURL;

    if (Array.isArray(styleRef.value)) {
      styleNameOrURL = styleRef.value[0];
      styleOptions = styleRef.value[1];
    } else {
      styleNameOrURL = styleRef.value;
    }

    if (styleNameOrURL === "openstreetmap") {
      return new TileLayer({ source: new OSM() });
    } else if (styleNameOrURL) {
      if (EUROPEANA_MAP_STYLE_NAMES.includes(styleNameOrURL)) {
        styleURL = useEuropeanaMapStyle(styleNameOrURL, styleOptions);
      } else {
        styleURL = styleNameOrURL;
      }
      const layerGroup = new LayerGroup();
      applyMapboxStyle(layerGroup, styleURL);
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

  const initFromHash = () => {
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const c = hashParams.get("c");
      const z = hashParams.get("z");
      if (c) {
        centreRef.value = c.split(",").map(Number);
      }
      if (z) {
        zoomRef.value = Number(z);
      }
    }
  };

  const trackInHash = () => {
    const url = new URL(window.location);
    const c = mapRef.value.getView().getCenter().join(",");
    const z = mapRef.value.getView().getZoom();
    const hashParams = new URLSearchParams({
      c,
      z,
    }).toString();
    url.hash = `#${hashParams}`;
    window.location.replace(url);
  };

  const applyStyle = () =>
    mapRef.value?.setLayers([createLayer()].filter(Boolean));

  const initMap = () => {
    if (!mapRef.value) {
      mapRef.value = new Map({ controls: [] });
    }

    mapRef.value.setTarget(targetRef.value);
    mapRef.value.setView(createView());
    applyStyle();

    if (hashRef.value) {
      mapRef.value.on("moveend", trackInHash);
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
