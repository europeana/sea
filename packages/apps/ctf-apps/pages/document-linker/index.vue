<script setup>
import {
  init as initContentfulApp,
  locations as contentfulAppLocations,
} from "@contentful/app-sdk";

const field = ref("");
const url = ref("");

useHead({
  title: "Document linker - Contentful app",
  bodyAttrs: {
    class: "",
    style: "background: transparent;",
  },
});

onMounted(() => {
  initContentfulApp((sdk) => {
    if (sdk.location.is(contentfulAppLocations.LOCATION_ENTRY_FIELD)) {
      sdk.window.startAutoResizer();
      url.value = sdk.parameters.instance.url;

      watch(field, (value) => sdk.field.setValue(value));
      sdk.field.onValueChanged((value) => (field.value = value));

      field.value = sdk.field.getValue();
    }
  });
});
</script>

<template>
  <div class="contentful">
    <div class="field-value m-3">Selected: {{ field }}</div>
    <button
      v-if="field"
      class="btn btn-secondary mb-3 ms-3"
      @click="field = null"
    >
      Clear
    </button>
    <FileBrowser v-model="field" :select="true" :url="url" />
  </div>
</template>
