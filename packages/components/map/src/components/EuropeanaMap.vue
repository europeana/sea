<script setup>
import { ref } from "vue";
import { useFetch } from "@vueuse/core";
import { configProps } from "@/config.js";
import { useOpenLayersMap } from "@/composables/openLayersMap.js";
import { useOpenLayersPointClusters } from "@/composables/openLayersPointClusters.js";
import pointIconSrc from "@/assets/img/ic_location.svg";
import "ol/ol.css";

const props = defineProps(configProps);

const data = ref(null);

if (props.json) {
  data.value = JSON.parse(props.json);
} else if (props.url) {
  useFetch(props.url)
    .json()
    .then((fetched) => {
      data.value = fetched.data.value;
    });
} else {
  throw new Error("No data JSON or URL supplied in props.");
}

const target = "europeana-map-map";

const { map } = useOpenLayersMap({ target });
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
