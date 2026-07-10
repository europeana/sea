<script setup>
import { computed, ref, inject } from "vue";
import { useFetch } from "@vueuse/core";
import "ol/ol.css";

import { useMapboxProtomapsStyle } from "@/composables/mapboxProtomapsStyle.js";
import { useOpenLayersMap } from "@/composables/openLayersMap.js";
import { useOpenLayersPointsVectorLayer } from "@/composables/openLayersPointsVectorLayer.js";
import { useOpenLayersFeatureStyles } from "@/composables/openLayersFeatureStyles.js";
import pointIconSrc from "@/assets/img/ic_location.svg";

const map = inject("map", null);
const injectedConfig = inject("config", null);

const DEFAULT_LOCALE = "en";

// NOTE: consider carefully if setting any defaults for props as they would
//       take precedence over injectedConfig values which may not be intended
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
  locale: {
    type: String,
    default: null,
  },
  style: {
    type: [Object, String],
    default: null,
  },
  styleOptions: {
    type: Object,
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
const locale = computed(
  () => props.locale || injectedConfig?.value?.locale || DEFAULT_LOCALE,
);
const styleOptions = computed(
  () => props.styleOptions || injectedConfig?.value?.styleOptions,
);
const style = computed(() => {
  const suppliedStyle = props.style || injectedConfig?.value?.style;

  if (suppliedStyle === "protomaps") {
    return useMapboxProtomapsStyle({
      ...styleOptions.value,
      locale: locale.value,
    });
  }

  return suppliedStyle;
});
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
useOpenLayersPointsVectorLayer({
  data,
  distance: singleFeatureStyleMinDimension * 1.5,
  minDistance: singleFeatureStyleMinDimension * 0.75,
  map,
  styleFeature,
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
