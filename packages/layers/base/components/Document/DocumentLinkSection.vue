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
  <div data-qa="markdown" class="row" tag="section">
    <div class="col col-12 col-lg-9">
      <h2 v-if="props.headline">
        {{ props.headline }}
      </h2>
      <DocumentBrowser id="reports-link" :url="props.url" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
:deep(h2) {
  vertical-align: left;
  margin-bottom: 1rem !important;

  @media (min-width: $bp-large) {
    margin-bottom: 2rem !important;
  }
}
</style>
