<script setup>
import {
  init as initContentfulApp,
  locations as contentfulAppLocations,
} from "@contentful/app-sdk";

const field = ref("");

useHead({
  title: "Disabled single line text - Contentful app",
  bodyAttrs: {
    class: "",
    style: "background: transparent;",
  },
});

onMounted(() => {
  initContentfulApp((sdk) => {
    if (sdk.location.is(contentfulAppLocations.LOCATION_ENTRY_FIELD)) {
      sdk.window.startAutoResizer();
      field.value = sdk.field.getValue();
      // onValueChanged returns a detachValueChangeHandler, should we use this?
      sdk.field.onValueChanged((value) => (field.value = value));
    }
  });
});
</script>

<template>
  <div class="contentful">
    <form class="mb-3">
      <input v-model="field" class="" disabled />
    </form>
  </div>
</template>

<style lang="scss" scoped>
.contentful {
  font-size: 11px;

  input:disabled {
    // thse styles need to be moved to somewhere where they can be shared among contentful applications
    background-color: #e9ecef;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    border-radius: 0.25rem;
    border: 0;
  }
}
</style>
