<script setup>

const value = ref(true);
const contentfulExtensionSdk = ref(true);

useHead({
    title: 'Firelserver manager - Contentful app',
    bodyAttrs: {
        class: '',
        style: 'background: transparent;'
    }
});

const updateValue = (newValue) => {
  value.value = newValue;
};
console.log('setting up mounted');
onMounted(() => {
  console.log('mounted');
  console.log('window.contentfulExtension', window.contentfulExtension);
  window.contentfulExtension.init(sdk => {
    contentfulExtensionSdk.value = sdk;
    if (sdk.location.is(window.contentfulExtension.locations.LOCATION_ENTRY_FIELD)) {
      sdk.window.startAutoResizer();
      value.value = sdk.field.getValue();
      // onValueChanged returns a detachValueChangeHandler, should we use this?
      sdk.field.onValueChanged(updateValue);
    }
  });
});
</script>

<template>
  <div class="contentful">
      {{ value }}
      <b-form-group>
        <b-form-input
          v-model="value"
          type="text"
          disabled
        />
      </b-form-group>
  </div>
</template>


<style lang="scss" scoped>
  .contentful {
    font-size: 11px;
  }
</style>
