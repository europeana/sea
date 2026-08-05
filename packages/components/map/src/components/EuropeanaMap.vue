<script setup>
import { computed, nextTick, onMounted, ref, inject } from "vue";
import { useFetch } from "@vueuse/core";
import "ol/ol.css";

import { useOpenLayersMap } from "@/composables/openLayersMap.js";
import { useOpenLayersPointsVectorLayer } from "@/composables/openLayersPointsVectorLayer.js";
import { useOpenLayersFeatureStyles } from "@/composables/openLayersFeatureStyles.js";
import { useOpenLayersKeyboardNavigation } from "@/composables/openLayersKeyboardNavigation.js";
import { useOpenLayersControls } from "@/composables/openLayersControls.js";
import { useOpenLayersPinPopoverOverlay } from "@/composables/openLayersPinPopoverOverlay.js";
import { useOpenLayersPinSpread } from "@/composables/openLayersPinSpread.js";

import pointIconSrc from "@/assets/img/ic_location.svg";

import { elementIdFor } from "@/utils/elementIdFor.js";

const map = inject("map", null);
const injectedConfig = inject("config", null);

// NOTE: consider carefully if setting any defaults for props as they would
//       take precedence over injectedConfig values which may not be intended
const props = defineProps({
  centre: {
    type: Array,
    default: null,
  },
  controls: {
    type: Object,
    default: null,
  },
  elementId: {
    type: String,
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
  // if an object, expected to be a Promise
  scrollTo: {
    type: [Boolean, Object],
    default: false,
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
// TODO: set some defaults, deep merged with supplied?
const controls = computed(
  () => props.controls || injectedConfig?.value?.controls,
);
const elementId = computed(
  () => props.elementId || injectedConfig?.value?.elementId || "europeana-map",
);
const hash = computed(() => props.hash || injectedConfig?.value?.hash);
const json = computed(() => props.json || injectedConfig?.value?.json);
const pinPopover = computed(
  () => props.pinPopover || injectedConfig?.value?.pinPopover,
);
const scrollTo = computed(
  () => props.scrollTo || injectedConfig?.value?.scrollTo,
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

const icon = {
  src: pointIconSrc,
  width: 24,
  height: 24,
};

useOpenLayersMap({
  centre,
  elementId,
  hash,
  map,
  style,
  zoom,
});

const { getSingleFeatureStyleMinDimension, styleFeature, styleSingleFeature } =
  useOpenLayersFeatureStyles({ icon });

const singleFeatureStyleMinDimension = getSingleFeatureStyleMinDimension();

const { spreadCluster, spreadClusterSource, spreadPinsAllowed } =
  useOpenLayersPinSpread({
    getSingleFeatureStyleMinDimension,
    map,
    styleSingleFeature,
  });

nextTick().then(() => {
  const { source } = useOpenLayersPointsVectorLayer({
    data,
    distance: singleFeatureStyleMinDimension * 1.5,
    spreadPinsAllowed,
    minDistance: singleFeatureStyleMinDimension * 0.75,
    map,
    styleFeature,
    spreadCluster,
  });

  // The order of adding the keyboard buttons, popover and controls here also defines the order these are inserted to the DOM
  if (controls.value?.keyboardNavigatePins) {
    useOpenLayersKeyboardNavigation({
      map,
      spreadClusterSource,
      source,
      navigatePinsButtonId: elementIdFor(
        elementId.value,
        "keyboardFocusPinToggle",
      ),
      announcerId: "announcer",
      pinSrLabel: controls.value?.keyboardNavigatePins?.srLabel,
    });
  }

  useOpenLayersPinPopoverOverlay({
    map,
    pinPopover,
  });

  useOpenLayersControls({ map, controls });
});

const scrollToMap = () => {
  const promise =
    scrollTo.value instanceof Promise ? scrollTo.value : Promise.resolve();

  promise.then(() => {
    document.getElementById(elementId.value)?.scrollIntoView();
  });
};

onMounted(() => {
  if (scrollTo.value) {
    scrollToMap();
  }
});
</script>

<template>
  <div :id="elementId" class="europeana-map">
    <button
      v-if="controls?.keyboardPanAndZoom"
      :id="elementIdFor(elementId, 'keyboardEventTarget')"
      class="keyboard-control"
      type="button"
    >
      {{ controls.keyboardPanAndZoom.label }}
    </button>
    <template v-if="controls?.keyboardNavigatePins">
      <button
        :id="elementIdFor(elementId, 'keyboardFocusPinToggle')"
        class="keyboard-control keyboard-nav-control"
        type="button"
      >
        {{ controls.keyboardNavigatePins.label }}
      </button>
      <span
        id="announcer"
        aria-live="polite"
        class="visually-hidden"
        aria-atomic="true"
      ></span>
    </template>
  </div>
</template>

<style lang="scss">
.europeana-map {
  width: 100%;
  height: 100%;

  .keyboard-control {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    opacity: 0; // hidden but accessible
    left: auto;
    background-color: #fff;
    border: none;
    padding: 0.5rem;
    z-index: -1;

    &:focus,
    &:focus ~ div .keyboard-nav-control {
      z-index: 1;
      opacity: 1;
    }
  }

  .keyboard-nav-control {
    top: 3.5rem;
  }

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
