<script setup>
import {
  init as initContentfulApp,
  locations as contentfulAppLocations,
} from "@contentful/app-sdk";

const field = ref("");
const fieldId = ref("field");
const showLabel = ref(true);
const ready = ref(false);

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
      fieldId.value = sdk.field.id;

      // onValueChanged returns a detachValueChangeHandler, should we use this?
      sdk.field.onValueChanged((value) => (field.value = value));

      // input label will be rendered outside the iframe by Contentful
      showLabel.value = false;

      ready.value = true;
    }
  });
});
</script>

<template>
  <div class="contentful">
    <form v-if="ready" class="mb-3">
      <label v-if="showLabel" :for="fieldId"> Value: </label>
      <input :id="fieldId" v-model="field" disabled />
    </form>
  </div>
</template>
