<script setup>
import { entryHasContentType } from "@/utils/contentful/index.js";
import parseMarkdown from "@/utils/markdown/parse.js";

defineProps({
  /**
   * H2 title to display above the info cards
   */
  title: {
    type: String,
    default: null,
  },
  /**
   * Text to display under title and above the info cards
   */
  text: {
    type: String,
    default: null,
  },
  /**
   * List of sections
   */
  sections: {
    type: Array,
    default: () => [],
  },
});
</script>
<template>
  <div class="landing-sub-section">
    <div class="container landing-sub-section-container">
      <div class="header mx-auto">
        <h2 class="mx-auto">
          {{ title }}
        </h2>
        <!-- eslint-disable vue/no-v-html -->
        <div
          v-if="text"
          class="text mx-auto mb-3"
          v-html="parseMarkdown(text)"
        />
        <!-- eslint-enable vue/no-v-html -->
      </div>
      <div v-for="(section, index) in sections" :key="index">
        <LandingImageCard
          v-if="entryHasContentType(section, 'ImageCard')"
          :card="section"
          title-tag="h3"
        />
        <LandingAutomatedCardGroup
          v-if="entryHasContentType(section, 'AutomatedCardGroup')"
          :genre="section.genre"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "@europeana/style/scss/variables";

.landing-sub-section {
  .landing-sub-section-container {
    padding-top: 3rem;
    border-bottom: 1px solid transparent; // fix for when any margin of the last child component causes different bg to display

    @media (min-width: $bp-large) {
      padding-top: 6rem;
    }

    @media (min-width: $bp-4k) {
      padding-top: 15rem;
    }
  }

  .header {
    max-width: 1250px;
    padding-bottom: 1rem;
    text-align: center;

    @media (min-width: $bp-medium) {
      padding-bottom: 4rem;
    }

    @media (min-width: $bp-4k) {
      max-width: 2500px;
      padding-bottom: 8rem;
    }

    h2 {
      max-width: $max-text-column-width;

      @media (min-width: $bp-4k) {
        max-width: $max-text-column-width-landing-4k;
      }
    }
  }

  .text {
    max-width: $max-text-column-width;

    @media (min-width: $bp-4k) {
      max-width: $max-text-column-width-landing-4k;
    }
  }

  .landing-content-card-group .container {
    max-width: none;
  }
}
</style>
