<script setup>
import { marked } from "marked";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  // TODO: find a better and cleaner solution
  // or remove in the future?
  richTextIsCard: {
    type: Boolean,
    default: true,
  },
});

const html = computed(() => marked.parse(props.text));
</script>
<template>
  <div
    data-qa="markdown"
    class="row"
    :class="{ 'mb-5': richTextIsCard }"
    tag="section"
  >
    <div class="col col-12" :class="richTextIsCard ? 'col-lg-6' : 'col-lg-9'">
      <div v-if="html && richTextIsCard" class="card">
        <!-- eslint-disable vue/no-v-html -->
        <div v-html="html" />
        <!-- eslint-enable vue/no-v-html -->
      </div>
      <!-- eslint-disable vue/no-v-html -->
      <div v-else-if="html && !richTextIsCard" v-html="html" />
      <!-- eslint-enable vue/no-v-html -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

:deep(img) {
  max-width: 100%;
}

.xxl-page {
  .col,
  .card {
    max-width: $max-text-column-width;
  }
}
</style>
