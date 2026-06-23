<script setup>
import { onMounted, watch } from "vue";

import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import VectorSource from "ol/source/Vector.js";
import Cluster from "ol/source/Cluster.js";
import VectorLayer from "ol/layer/Vector.js";
import CircleStyle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Icon from "ol/style/Icon.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import Text from "ol/style/Text.js";
import { useGeographic } from "ol/proj.js";
import "ol/ol.css";

import { configProps } from "@/config.js";
import { useMapData } from "@/composables/mapData.js";
import iconUrl from "@/assets/img/ic_location.svg";

const props = defineProps(configProps);
const { data, centre } = useMapData({ json: props.json, url: props.url });

let map;

watch(
  data,
  () => {
    if (data.value) {
      map?.addLayer(createClustersLayer());
    }
  },
  { immediate: true },
);

const createMap = () => {
  // use Geographic projection for correct position of geo coordinates
  useGeographic();

  const map = new Map({
    target: "europeana-map-map",
    layers: [new TileLayer({ source: new OSM() })],
    view: new View({
      center: centre.value,
      minZoom: 1,
      projection: "EPSG:3857",
      zoom: 4,
    }),
  });

  if (data.value) {
    map.addLayer(createClustersLayer());
  }

  return map;
};

const createClustersLayer = () => {
  const features = data.value.features.map(
    (feature) =>
      new Feature({
        geometry: new Point(feature.geometry.coordinates),
        name: feature.id,
      }),
  );

  const source = new VectorSource({
    features,
  });

  const clusterSource = new Cluster({
    distance: parseInt(40, 10),
    minDistance: parseInt(20, 10),
    source,
  });

  const styleCache = {};

  return new VectorLayer({
    source: clusterSource,
    style(feature) {
      const size = feature.get("features").length;
      let style = styleCache[size];
      if (!style) {
        if (size === 1) {
          style = new Style({
            image: new Icon({
              src: iconUrl,
              width: 32,
              height: 32,
            }),
          });
        } else {
          style = new Style({
            image: new CircleStyle({
              radius: 14,
              stroke: new Stroke({
                color: "#000",
              }),
              fill: new Fill({
                color: "#000",
              }),
            }),
            text: new Text({
              text: size.toString(),
              fill: new Fill({
                color: "#fff",
              }),
              font: '700 0.875rem "Open Sans", "Arial", sans-serif',
            }),
          });
        }
        styleCache[size] = style;
      }
      return style;
    },
  });
};

onMounted(() => {
  map = createMap();
});
</script>

<template>
  <div id="europeana-map-map" class="europeana-map-map" />
</template>

<style lang="scss">
.europeana-map-map {
  width: 100vw;
  height: 100vh;
}
</style>
