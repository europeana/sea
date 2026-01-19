<script setup>
import parseMarkdown from "@/utils/markdown/parse.js";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
});

const html = computed(() => parseMarkdown(props.text));
</script>
<template>
  <div data-qa="markdown" class="row" tag="section">
    <div class="col col-12 col-lg-9">
      <!-- eslint-disable vue/no-v-html -->
      <div v-html="html" />
      <!-- eslint-enable vue/no-v-html -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

:deep(img) {
  max-width: 100%;
}

:deep(h2) {
  margin-bottom: 1rem !important;

  @media (min-width: $bp-large) {
    margin-bottom: 2rem !important;
  }
}

.xxl-page {
  .col {
    max-width: $max-text-column-width;

    @media (min-width: $bp-4k) {
      max-width: $max-text-column-width-landing-4k;
    }
  }
}
</style>
