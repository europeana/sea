<script setup>
import { computed } from "vue";
import parseMarkdown from "../../utils/markdown/parse.js";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  nameEnglish: {
    type: String,
    default: null,
  },
  text: {
    type: String,
    required: true,
  },
  link: {
    type: Object,
    default: null,
  },
  illustration: {
    type: Object,
    default: null,
  },
  /**
   * Banner variant to use,
   * affects button styling.
   * @values default, primary
   */
  variant: {
    type: String,
    default: "default",
  },
  /**
   * Butten variant to use,
   * overides banner button default.
   * @values secondary, primary
   */
  buttonVariant: {
    type: String,
    default: null,
  },
});

const html = computed(() => {
  return parseMarkdown(props.text);
});

const btnClass = computed(() => {
  if (props.buttonVariant) {
    return `btn-${props.buttonVariant}`;
  }
  return props.variant === "default" ? "btn-secondary" : "btn-primary";
});

// TODO: Handle logging to matomo
</script>

<template>
  <div class="cta-banner d-flex flex-md-row flex-column">
    <div
      v-if="props.illustration"
      class="cta-illustration align-items-center justify-content-center"
    >
      <ImageOptimised
        :alt="props.illustration.image.description"
        :src="props.illustration.image.url"
        :width="props.illustration.image.width"
        :height="props.illustration.image.height"
        :content-type="props.illustration.image.contentType"
        :max-width="1100"
        :lazy="true"
      />
    </div>
    <div
      class="cta-content align-items-center justify-content-center"
      :class="variant"
    >
      <h2>
        {{ props.name }}
      </h2>
      <!-- eslint-disable vue/no-v-html -->
      <div v-html="html" />
      <!-- eslint-enable   vue/no-v-html -->
      <GenericCallToAction
        v-if="props.link"
        :url="props.link.url"
        :text="props.link.text"
        :classes="btnClass"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.cta-banner {
  margin-bottom: 2rem;
  margin-left: auto;
  margin-right: auto;
  font-size: $font-size-base;
  width: 100%;

  @media (min-width: $bp-wqhd) {
    min-height: 320px;
  }

  @media (min-width: $bp-4k) {
    font-size: $font-size-large;
    margin-bottom: 3rem;
    min-height: 442px;
  }

  .cta-content {
    position: relative;
    padding: 1.5rem 1.75rem 2.5rem;
    text-align: center;
    font-size: $font-size-base;

    @media (min-width: $bp-medium) {
      height: auto;
      flex: 0 0 100%;
    }

    @media (min-width: $bp-extralarge) {
      font-size: $font-size-medium;
      padding: 3rem 3.75rem;
    }

    @media (min-width: $bp-4k) {
      font-size: $font-size-medium-4k;
    }
    &.primary {
      color: $white;
    }
  }
  .cta-illustration {
    position: absolute;
    width: 100%;
    height: 100%;
    img {
      width: 100%;
      height: 100%;
    }
  }
}

.home-cta {
  margin: 3rem auto;

  @media (min-width: $bp-4k) {
    margin: 4.5rem auto;
  }
}
</style>
