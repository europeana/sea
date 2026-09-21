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

onMounted(() => {
  window.contentfulExtension.init(sdk => {
    contentfulExtensionSdk = sdk;
    if (sdk.location.is(window.contentfulExtension.locations.LOCATION_ENTRY_FIELD)) {
      sdk.window.startAutoResizer();
      this.value = sdk.field.getValue();
      // onValueChanged returns a detachValueChangeHandler, should we use this?
      sdk.field.onValueChanged(this.updateValue);
    }
  });
});

const updateValue = (newValue) => {
  value = newValue;
};

</script>

<template>
  <div class="contentful">
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
