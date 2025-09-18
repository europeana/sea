<script setup>
import parseMarkdown from "@/utils/markdown/parse.js";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: "",
  },

  hero: {
    type: Object,
    default: null,
  },

  /**
   * If `true` hero image covers 16:9 container
   */
  coverHeroImage: {
    type: Boolean,
    default: true,
  },

  contextLabel: {
    type: String,
    default: null,
  },
});

const heroImage = computed(() => (props.hero ? props.hero.image : null));
const heroImageAlt = computed(() => heroImage.value?.description || "");
</script>
<template>
  <div class="container mt-3">
    <div class="row justify-content-center">
      <div class="col col-12 col-lg-8 mb-md-3 mb-lg-4">
        <div class="title">
          <div v-if="contextLabel" class="context-label">
            {{ contextLabel }}
          </div>
          <slot />
          <h1 class="mb-2">
            {{ title }}
          </h1>
        </div>
      </div>
    </div>
    <div v-if="heroImage" class="row justify-content-center">
      <div class="col col-12 col-lg-8">
        <ImageWithAttributionContainer :hero="coverHeroImage">
          <ImageWithAttribution
            :src="heroImage.url"
            :content-type="heroImage.contentType"
            :attribution="hero"
            :alt="heroImageAlt"
            :width="heroImage.width || null"
            :height="heroImage.height || null"
          />
        </ImageWithAttributionContainer>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col col-12 col-lg-8 mb-md-3">
        <!-- eslint-disable vue/no-v-html -->
        <div
          v-if="description"
          class="subtitle"
          v-html="parseMarkdown(description)"
        />
        <!-- eslint-enable vue/no-v-html -->
      </div>
    </div>
  </div>
</template>
