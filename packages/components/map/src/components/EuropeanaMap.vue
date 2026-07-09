<script setup>
import { computed, ref, inject } from "vue";
import { useFetch } from "@vueuse/core";
import "ol/ol.css";

import { useOpenLayersMap } from "@/composables/openLayersMap.js";
import { useOpenLayersPointsVectorLayer } from "@/composables/openLayersPointsVectorLayer.js";
import { useOpenLayersFeatureStyles } from "@/composables/openLayersFeatureStyles.js";
import { useOpenLayersKeyboardNavigation } from "@/composables/openLayersKeyboardNavigation.js";
import pointIconSrc from "@/assets/img/ic_location.svg";

const map = inject("map", null);
const injectedConfig = inject("config", null);

const props = defineProps({
  centre: {
    type: Array,
    default: null,
  },
  hash: {
    type: Boolean,
    default: false,
  },
  json: {
    type: String,
    default: null,
  },
  style: {
    type: [Object, String],
    default: null,
  },
  url: {
    type: String,
    default: null,
  },
  zoom: {
    type: Number,
    default: null,
  },
});

const data = ref(null);

const centre = computed(() => props.centre || injectedConfig?.value?.centre);
const hash = computed(() => props.hash || injectedConfig?.value?.hash);
const json = computed(() => props.json || injectedConfig?.value?.json);
const style = computed(() => props.style || injectedConfig?.value?.style);
const url = computed(() => props.url || injectedConfig?.value?.url);
const zoom = computed(() => props.zoom || injectedConfig?.value?.zoom);

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
const icon = {
  src: pointIconSrc,
  width: 24,
  height: 24,
};

useOpenLayersMap({
  centre,
  hash,
  map,
  style,
  target,
  zoom,
});

const { getSingleFeatureStyleMinDimension, styleFeature } =
  useOpenLayersFeatureStyles({ icon, map });
const singleFeatureStyleMinDimension = getSingleFeatureStyleMinDimension();
const { clusterSource } = useOpenLayersPointsVectorLayer({
  data,
  distance: singleFeatureStyleMinDimension * 1.5,
  minDistance: singleFeatureStyleMinDimension * 0.75,
  map,
  styleFeature,
});
// TODO: only initialise when points are interactive / when there are clusters
const { handleFocusOnKeyDown, clearFocusFeature } =
  useOpenLayersKeyboardNavigation({
    map,
    clusterSource,
  });
</script>

<template>
  <button @keydown="handleFocusOnKeyDown" @blur="clearFocusFeature">
    Cycle
  </button>
  <!-- TODO: consider implementing a button component similar to the MediaImageViewerKeyboardToggle -->
  <!-- keep tabindex set to 0 to enable keyboard a11y -->
  <div :id="target" :class="target" tabindex="0" />
</template>

<style lang="scss">
.europeana-map-map {
  width: 100vw;
  height: 80vh;
}
</style>
