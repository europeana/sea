<script setup>
import parseMarkdown from "@europeana/sea-base-layer/utils/markdown/parse.js";
import { responsiveBackgroundImageCSSVars } from "@europeana/sea-base-layer/utils/contentful/assets.js";

const props = defineProps({
  /**
   * H1 title to display in the hero.
   */
  headline: {
    type: String,
    required: true,
  },
  /**
   * text to display accompanying the headline
   */
  text: {
    type: String,
    default: null,
  },
  /**
   * CTA button to link to a URL or section of the page
   */
  // cta: {
  // type: Object,
  // default: null
  // },
  // ctaHelpText: {
  // type: String,
  // default: null
  // },
  /**
   * Image used as a background - no attribution.
   * May contain a display profile in order to
   * change text and share button style/colour.
   */
  heroImage: {
    type: Object,
    default: null,
  },
});

const SRCSET_PRESETS = {
  small: { w: 576, h: 350, fit: "fill" },
  medium: { w: 768, h: 310, fit: "fill" },
  large: { w: 992, h: 300, fit: "fill" },
  xl: { w: 1200, h: 300, fit: "fill" },
  xxl: { w: 1400, h: 300, fit: "fill" },
  xxxl: { w: 1880, h: 300, fit: "fill" },
  wqhd: { w: 2520, h: 350, fit: "fill" },
  "4k": { w: 3020, h: 350, fit: "fill" },
  "4k+": { w: 3840, h: 680, fit: "fill" },
};

const imageCSSVars = computed(() => {
  if (props.heroImage?.image) {
    if (props.heroImage.image?.contentType === "image/svg+xml") {
      return { "--bg-img-small": `url('${props.heroImage.image.url}')` };
    } else {
      return responsiveBackgroundImageCSSVars(
        props.heroImage?.image,
        SRCSET_PRESETS,
        props.heroImage?.profile,
      );
    }
  } else {
    return null;
  }
});

const buttonClass = computed(() => {
  if (["highlight"].includes(props.heroImage?.profile?.background)) {
    return "btn-light";
  } else {
    return "btn-secondary";
  }
});
</script>

<template>
  <div class="landing-hero position-relative">
    <div
      v-if="heroImage"
      class="hero-background responsive-backround-image"
      :style="imageCSSVars"
      role="img"
    />
    <div class="container d-flex">
      <header
        class="hero-content"
        :class="
          heroImage?.profile?.background === 'highlight' ? 'text-white' : ''
        "
      >
        <!-- eslint-disable vue/no-v-html -->
        <div v-html="parseMarkdown(`# ${headline}\n${text}`)" />
        <!-- eslint-enable vue/no-v-html -->
        <ShareButton :variant="buttonClass" class="mt-3 mt-sm-4" />
        <ShareSocialModal />
      </header>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.hero-background {
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  background-size: cover;
  background-repeat: no-repeat;

  &.bg-position-y-center {
    background-position-y: center;
  }

  &.bg-color-highlight {
    background-color: $blue;
  }
}

.hero-content {
  padding-top: 3.625rem;
  padding-bottom: 2rem;
  position: relative;
  height: 19.375rem;

  @media (min-width: $bp-4k) {
    padding-top: 7rem;
    padding-bottom: 5rem;
  }

  :deep(h1) {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    line-height: 1.5;

    @media (min-width: ($bp-medium + 1px)) {
      font-size: 2.875rem;
      line-height: 1.2;
    }

    @media (min-width: $bp-4k) {
      font-size: 6rem;
      margin-bottom: calc(1.5 * 0.75rem);
    }

    em {
      font-style: normal;
      color: $blue;
    }
  }

  :deep(p) {
    font-weight: 400;
  }

  &.text-white {
    :deep(a) {
      color: $white;
    }
  }
}
</style>
