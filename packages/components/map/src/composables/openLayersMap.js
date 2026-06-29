import { onMounted, ref, unref } from "vue";

import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import { useGeographic } from "ol/proj.js";

const projection = "EPSG:3857";

const centreOfEurope = [9.254419, 50.102223];

export const useOpenLayersMap = ({ centre, target } = {}) => {
  const map = ref(null);

  // use Geographic projection for correct position of geo coordinates
  useGeographic();

  const createMap = () => {
    return new Map({
      target,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: unref(centre) || centreOfEurope,
        minZoom: 1,
        projection,
        zoom: 4,
      }),
    });
  };

  onMounted(() => {
    map.value = createMap();
  });

  return {
    map,
  };
};
