<script setup>
const props = defineProps({
  headline: {
    type: String,
    required: false,
    default: null,
  },
  url: {
    type: String,
    required: true,
  },
});
</script>
<template>
  <div class="document-link-section">
    <h2 v-if="props.headline">
      {{ props.headline }}
    </h2>
    <FileBrowser id="reports-link" :url="props.url" />
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
:deep(h2) {
  margin-bottom: 1rem !important;

  @media (min-width: $bp-large) {
    margin-bottom: 2rem !important;
  }
}
</style>
