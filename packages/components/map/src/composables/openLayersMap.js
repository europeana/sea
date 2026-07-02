import { onMounted, toRef, unref, watch } from "vue";

import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import { useGeographic } from "ol/proj.js";
import { apply as applyMapboxStyle } from "ol-mapbox-style";
import LayerGroup from "ol/layer/Group.js";

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
  const styleRef = toRef(style);
  const targetRef = toRef(target);
  // unref first in case it's a computed and we need to set it
  const zoomRef = toRef(unref(zoom) || 4);

  // use Geographic projection for correct position of geo coordinates
  useGeographic();

  const createLayer = () => {
    if (styleRef.value) {
      const layerGroup = new LayerGroup();
      applyMapboxStyle(layerGroup, styleRef.value);
      return layerGroup;
    } else {
      return new TileLayer({ source: new OSM() });
    }
  };

  const createView = () => {
    return new View({
      center: centreRef.value,
      minZoom: 1,
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

  const initMap = () => {
    if (!mapRef.value) {
      mapRef.value = new Map();
    }

    mapRef.value.setTarget(targetRef.value);
    mapRef.value.setView(createView());
    mapRef.value.setLayers([createLayer()]);

    if (hashRef.value) {
      mapRef.value.on("moveend", trackInHash);
    }
  };

  watch(styleRef, () => {
    mapRef.value?.setLayers([createLayer()]);
  });

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
