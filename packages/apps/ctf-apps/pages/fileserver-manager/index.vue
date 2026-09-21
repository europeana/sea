<script setup>
const fieldValue = ref("");
const contentfulExtensionSdk = ref(true);

useHead({
  title: "Firelserver manager - Contentful app",
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
      <input v-model="fieldValue" class="" />
    </form>
  </div>
</template>

<style lang="scss" scoped>
.contentful {
  font-size: 11px;
}

input {
  background-color: #e9ecef;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.25rem;
  box-shadow: rgba(225, 228, 232, 0.2) 0px 2px 0px inset;
  box-sizing: border-box;
  background-color: rgb(255, 255, 255);
  border: 1px solid rgb(207, 217, 224);
}
</style>
