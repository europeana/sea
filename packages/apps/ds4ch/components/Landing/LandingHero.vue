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
   * Image used as a background - no attribution.
   */
  heroImage: {
    type: Object,
    default: null,
  },
  /**
   * Variant to determine alternate styling for text/button colours.
   * @values alternate
   */
  variant: {
    type: String,
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
  "4kup": { w: 3840, h: 680, fit: "fill" },
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
  if (props.variant === "alternate") {
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
      class="hero-background responsive-background-image"
      :style="imageCSSVars"
      role="img"
    />
    <div class="container d-flex position-relative">
      <div class="row">
        <div class="col col-12 col-lg-7">
          <header
            class="hero-content"
            :class="variant === 'alternate' ? 'text-white' : ''"
          >
            <h1>{{ headline }}</h1>
            <!-- eslint-disable vue/no-v-html -->
            <div class="text pb-3" v-html="parseMarkdown(text)" />
            <!-- eslint-enable vue/no-v-html -->
            <ShareButton :variant="buttonClass" />
            <ShareSocialModal :share-to="['linkedin', 'bluesky', 'facebook']" />
          </header>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "assets/scss/variables";
@import "assets/scss/responsive-background-image";

.landing-hero {
  padding-top: $page-header-height; // leave space for the fixed positioned header

  @media (min-width: $bp-4k) {
    padding-top: $page-header-height-4k;
  }
}

.hero-background {
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  background-size: cover;
  background-repeat: no-repeat;
}

.container {
  @media (min-width: $bp-4k) {
    max-width: 3015px;
  }
}

.hero-content {
  padding-top: 3rem;
  padding-bottom: 3rem;

  @media (min-width: $bp-4k) {
    padding-top: 6rem;
    padding-bottom: 6rem;
  }

  h1 {
    font-size: $font-size-24;
    font-weight: 700;
    margin-bottom: 0.75rem;
    line-height: 1.2;

    @media (min-width: ($bp-medium + 1px)) {
      font-size: $font-size-34;
    }

    @media (min-width: $bp-4k) {
      font-size: $font-size-68;
      margin-bottom: calc(1.5 * 0.75rem);
    }
  }

  .text {
    font-weight: 400;

    @media (min-width: $bp-medium) {
      font-size: $font-size-20;
    }
    @media (min-width: $bp-4k) {
      font-size: $font-size-40;
    }
  }

  &.text-white {
    :deep(a) {
      color: $white;
    }
  }

  :deep(.icon-share) {
    font-size: $font-size-18;

    @media (min-width: $bp-4k) {
      font-size: $font-size-36;
    }
  }
}
</style>
