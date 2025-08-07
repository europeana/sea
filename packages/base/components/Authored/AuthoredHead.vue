<script setup>
import parseMarkdown from "@/utils/markdown/parse.js";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },

  subtitle: {
    type: String,
    default: "",
  },

  description: {
    type: String,
    default: "",
  },

  exhibitionTitle: {
    type: String,
    default: "",
  },

  hero: {
    type: Object,
    default: null,
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
  <div class="container">
    <div class="row justify-content-center">
      <div class="col col-12 col-lg-8 mb-3 mb-lg-4">
        <article>
          <div class="title">
            <div v-if="contextLabel" class="context-label mb-1">
              {{ contextLabel }}
            </div>
            <h2 v-if="exhibitionTitle" class="subtitle">
              {{ exhibitionTitle }}
            </h2>
            <h1 class="mb-2">
              {{ title }}
            </h1>
            <p
              v-if="subtitle || description"
              class="subtitle mb-2"
              v-html="parseMarkdown(subtitle || description)"
            />
          </div>
        </article>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col col-12 col-lg-8">
        <ImageWithAttributionContainer
          v-if="heroImage"
          :src="heroImage.url"
          :content-type="heroImage.contentType"
          :rights-statement="hero.license"
          :attribution="hero"
          :alt="heroImageAlt"
          hero
        />
      </div>
    </div>
  </div>
</template>
