<script setup>
import { computed, ref, inject } from "vue";
import { useFetch } from "@vueuse/core";
import "ol/ol.css";

import { useOpenLayersMap } from "@/composables/openLayersMap.js";
import { useOpenLayersPointsVectorLayer } from "@/composables/openLayersPointsVectorLayer.js";
import { useOpenLayersFeatureStyles } from "@/composables/openLayersFeatureStyles.js";
import { useOpenLayersControls } from "@/composables/openLayersControls.js";
import pointIconSrc from "@/assets/img/ic_location.svg";

const map = inject("map", null);
const injectedConfig = inject("config", null);

const props = defineProps({
  centre: {
    type: Array,
    default: null,
  },
  controls: {
    type: Object,
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
  pinPopover: {
    type: Object,
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
const controls = computed(
  () => props.controls || injectedConfig?.value?.controls,
);
const hash = computed(() => props.hash || injectedConfig?.value?.hash);
const json = computed(() => props.json || injectedConfig?.value?.json);
const pinPopover = computed(
  () => props.pinPopover || injectedConfig?.value?.pinPopover,
);
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
useOpenLayersPointsVectorLayer({
  data,
  distance: singleFeatureStyleMinDimension * 1.5,
  minDistance: singleFeatureStyleMinDimension * 0.75,
  map,
  pinPopover,
  styleFeature,
});
useOpenLayersControls({ map, controls });
</script>

<template>
  <div :id="target" :class="target" />
</template>

<style lang="scss">
.europeana-map-map {
  width: 100%;
  height: 100%;

  .ol-control {
    background-color: transparent;
    top: auto;
    right: 1.25rem;
    left: auto;

    &.ol-zoom {
      bottom: 6.25rem;

      button:disabled {
        background-color: lightgrey;
        cursor: not-allowed;
      }
    }

    &.ol-full-screen {
      bottom: 3.5rem;
    }

    button {
      font-size: 0; // visually-hide text, acessible for AT (a11y)
      width: 2.25rem;
      height: 2.25rem;
      padding: 0.25rem;
      margin: 0 0 0.5rem 0;
      border-radius: 0;

      &:before {
        content: "";
        background-color: black;
        width: 100%;
        display: block;
        height: 100%;
        mask-repeat: no-repeat;
        mask-position: center;
      }

      &:hover {
        outline: none;

        &:before {
          background-color: #4d4d4d;
        }
      }
      &:focus {
        outline: none;
      }
      &:focus-visible {
        outline: auto;
      }

      &.ol-full-screen-false:before {
        mask-image: url(@/assets/img/ic_fullscreen.svg);
      }
      &.ol-full-screen-true:before {
        mask-image: url(@/assets/img/ic_fullscreenexit.svg);
      }
      &.ol-zoom-in:before {
        mask-image: url(@/assets/img/ic_zoomin.svg);
      }
      &.ol-zoom-out:before {
        mask-image: url(@/assets/img/ic_zoomout.svg);
      }
    }

    &.ol-attribution {
      bottom: 1rem;
      background-color: white;
      margin-bottom: 0.25rem;
      border-radius: 0;

      button {
        margin-bottom: 0;

        &:before {
          mask-image: url(@/assets/img/ic_infocircle.svg);
        }
      }
    }
  }
}
</style>
