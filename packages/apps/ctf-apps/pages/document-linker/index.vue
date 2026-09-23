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

      field.value = sdk.field.getValue();
      sdk.field.onValueChanged((value) => (field.value = value));
      watch(field, (value) => sdk.field.setValue(value));
    }
  });
});
</script>

<template>
  <div class="contentful">
    Field value: {{ field }}
    <FileBrowser v-model="field" :select="true" :url="url" />
  </div>
</template>

<style lang="scss" scoped>
.contentful {
  font-size: 11px;
}

input {
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.25rem;
  box-shadow: rgba(225, 228, 232, 0.2) 0px 2px 0px inset;
  box-sizing: border-box;
  background-color: rgb(255, 255, 255);
  border: 1px solid rgb(207, 217, 224);
}
</style>
