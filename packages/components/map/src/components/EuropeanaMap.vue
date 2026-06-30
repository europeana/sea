<script setup>
import { computed, ref, inject } from "vue";
import { useFetch } from "@vueuse/core";
import "ol/ol.css";

import { useOpenLayersMap } from "@/composables/openLayersMap.js";
import { useOpenLayersPointClusters } from "@/composables/openLayersPointClusters.js";
import pointIconSrc from "@/assets/img/ic_location.svg";

const map = inject("map", null);
const injectedConfig = inject("config", null);

const props = defineProps({
  json: {
    type: String,
    default: null,
  },
  style: {
    type: String,
    default: null,
  },
  url: {
    type: String,
    default: null,
  },
});

const data = ref(null);

const url = computed(() => props.url || injectedConfig?.value?.url);
const json = computed(() => props.json || injectedConfig?.value?.json);
const style = computed(() => props.style || injectedConfig?.value?.style);

if (json.value) {
  data.value = JSON.parse(json.value);
} else if (url.value) {
  useFetch(url.value)
    .json()
    .then((fetched) => {
      data.value = fetched.data.value;
    });
} else {
  throw new Error("No data JSON or URL supplied.");
}

const target = "europeana-map-map";

useOpenLayersMap({
  map,
  style,
  target,
});
useOpenLayersPointClusters({
  data,
  map,
  pointIconSrc,
});
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
