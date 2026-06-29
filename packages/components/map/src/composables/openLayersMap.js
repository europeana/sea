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

export const useOpenLayersMap = ({ centre, map, style, target } = {}) => {
  const mapRef = toRef(map);

  // use Geographic projection for correct position of geo coordinates
  useGeographic();

  const createLayer = () => {
    const styleValue = unref(style);
    if (styleValue) {
      const layerGroup = new LayerGroup();
      applyMapboxStyle(layerGroup, styleValue);
      return layerGroup;
    } else {
      return new TileLayer({ source: new OSM() });
    }
  };

  const createView = () => {
    return new View({
      center: unref(centre) || centreOfEurope,
      minZoom: 1,
      projection,
      zoom: 4,
    });
  };

  const initMap = () => {
    if (!mapRef.value) {
      mapRef.value = new Map();
    }

    mapRef.value.setTarget(target);
    mapRef.value.setView(createView());
    mapRef.value.setLayers([createLayer()]);
  };

  watch(toRef(style), () => {
    mapRef.value?.setLayers([createLayer()]);
  });

  onMounted(() => {
    initMap();
  });

  return {
    map: mapRef,
  };
};
