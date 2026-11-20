<script setup>
import parseMarkdown from "@/utils/markdown/parse.js";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  text: {
    type: String,
    default: "",
  },
  link: {
    type: Object,
    default: null,
  },
  buttonVariant: {
    type: String,
    default: "btn-primary",
  },
});

const html = computed(() => {
  return parseMarkdown(props.text);
});
</script>

<template>
  <div class="primary-cta text-center">
    <h2 v-if="title" data-qa="primary cta title">
      {{ title }}
    </h2>
    <!-- eslint-disable vue/no-v-html -->
    <div class="primary-cta-rich-text text-left" v-html="html" />
    <!-- eslint-enable vue/no-v-html -->
    <GenericCallToAction
      v-if="link"
      :url="link.url"
      :text="link.text"
      :classes="buttonVariant"
    />
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.primary-cta {
  background-color: $white;
  max-width: calc(100% + 100px);
  padding: 1.5rem calc((50vw - 50%) / 2);
  margin: 0 calc((-50vw + 50%) / 2) 2rem;

  @media (min-width: $bp-large) {
    padding: 1.5rem 50px;
    margin: 0 -50px 2rem;
  }
}

.xxl-page .primary-cta {
  margin: 0 0 2rem;

  @media (min-width: $bp-large) {
    width: calc(50%);
    max-width: calc($max-text-column-width + 100px);
  }
}
</style>
