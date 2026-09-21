<script setup>
const fieldValue = ref("");
const contentfulExtensionSdk = ref(true);

useHead({
  title: "Disabled single line text - Contentful app",
  bodyAttrs: {
    class: "",
    style: "background: transparent;",
  },
});

const updateValue = (newValue) => {
  fieldValue.value = newValue;
};

onMounted(() => {
  window.contentfulExtension.init((sdk) => {
    contentfulExtensionSdk.value = sdk;
    if (
      sdk.location.is(window.contentfulExtension.locations.LOCATION_ENTRY_FIELD)
    ) {
      sdk.window.startAutoResizer();
      fieldValue.value = sdk.field.getValue();
      // onValueChanged returns a detachValueChangeHandler, should we use this?
      sdk.field.onValueChanged(updateValue);
    }
  });
});
</script>

<template>
  <div class="contentful">
    <form class="mb-3">
      <input id="value" v-model="fieldValue" class="" disabled />
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
