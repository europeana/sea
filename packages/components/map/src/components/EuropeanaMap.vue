<script setup>
import { configProps } from "@/config.js";
import { useMapData } from "@/composables/mapData.js";
import { useOpenLayersMap } from "@/composables/openLayersMap.js";
import { useOpenLayersPointClusters } from "@/composables/openLayersPointClusters.js";
import pointIconSrc from "@/assets/img/ic_location.svg";
import "ol/ol.css";

const props = defineProps(configProps);
const target = "europeana-map-map";

const { data, centre } = useMapData({ json: props.json, url: props.url });
const { map } = useOpenLayersMap({ centre, target });
useOpenLayersPointClusters({ data, map, pointIconSrc });
</script>

<template>
  <div :id="target" :class="target" />
</template>

<style lang="scss">
.europeana-map-map {
  width: 100%;
  height: 100%;
}
</style>
