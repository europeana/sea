<script setup>
import parseMarkdown from "@europeana/sea-base-layer/utils/markdown/parse.js";

const props = defineProps({
  /**
   * Heading title to display above the cards
   */
  title: {
    type: String,
    default: null,
  },
  /**
   * Heading title level to use. Override default for when used in subsection to keep correct heading structure.
   */
  titleTag: {
    type: String,
    default: "h2",
  },
  /**
   * Text to display under title and above the cards
   */
  text: {
    type: String,
    default: null,
  },
  /**
   * List of cards
   */
  cards: {
    type: Array,
    default: null,
  },
});
</script>
<template>
  <div
    v-if="title || text"
    class="card-group-header col col-lg-8 text-center mx-auto px-0"
  >
    <component :is="titleTag" v-if="title">
      {{ title }}
    </component>
    <!-- eslint-disable vue/no-v-html -->
    <div v-if="text" class="text mb-3" v-html="parseMarkdown(text)" />
    <!-- eslint-enable vue/no-v-html -->
  </div>
  <div class="row row-cols-1 row-cols-xl-4 g-4 justify-content-center">
    <div v-for="(card, index) in props.cards" :key="index" class="col">
      <ContentCard
        v-if="card['__typename'] === 'ContentCard'"
        :title="card.name"
        :url="card.url"
        :image-url="card.primaryImageOfPage?.image?.url"
        :image-content-type="card.primaryImageOfPage?.image?.contentType"
        :image-width="card.primaryImageOfPage?.image?.width"
        :image-height="card.primaryImageOfPage?.image?.height"
      />
      <CardTestimonialCard
        v-else-if="card['__typename'] === 'TestimonialCard'"
        :testimonial-text="card.text"
        :attribution="card.attribution"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "assets/scss/variables";

.card-group-header {
  padding-top: 3rem;
  padding-bottom: 1rem;

  @media (min-width: $bp-medium) {
    padding-top: 6rem;
    padding-bottom: 2rem;
  }

  @media (min-width: $bp-4k) {
    padding-top: 12rem;
    padding-bottom: 4rem;
  }

  h2 {
    font-size: $font-size-20;
    margin-bottom: 1rem;

    @media (min-width: $bp-medium) {
      font-size: $font-size-28;
    }

    @media (min-width: $bp-4k) {
      font-size: $font-size-56;
      margin-bottom: 2rem;
    }
  }
}

.row {
  padding-bottom: 3rem;

  @media (min-width: $bp-medium) {
    padding-bottom: 6rem;
  }

  @media (min-width: $bp-4k) {
    padding-bottom: 12rem;
  }
}
</style>
