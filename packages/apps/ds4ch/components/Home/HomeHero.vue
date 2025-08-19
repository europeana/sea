<script setup>
import { responsiveBackgroundImageCSSVars } from "@europeana/sea-base-layer/utils/contentful/assets.js";
import parseMarkdown from "@europeana/sea-base-layer/utils/markdown/parse.js";

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
  cta: {
    type: Object,
    default: null,
  },
  /**
   * Image used as background
   * Gets a black overlay (medium portrait)
   */
  heroImage: {
    type: Object,
    default: null,
  },
});

const CSS_VARS_PRESETS = {
  small: { w: 650, h: 850, fit: "crop", q: 100, f: "top" },
  medium: { w: 850, h: 850, fit: "crop", q: 100, f: "top" },
  large: { w: 992, h: 992, fit: "crop", q: 100, f: "top" },
  xl: { w: 1080, h: 1080, fit: "crop", q: 100, f: "left" },
  xxl: { w: 1080, h: 1080, fit: "crop", q: 100, f: "left" },
  xxxl: { w: 1080, h: 1080, fit: "crop", q: 100, f: "left" },
  wqhd: { w: 1200, h: 1200, fit: "crop", q: 100, f: "left" },
  "4k": { w: 1400, h: 1400, fit: "crop", q: 100, f: "left" },
  "4kup": { w: 1400, h: 1400, fit: "crop", q: 100, f: "left" },
};

const imageCSSVars = computed(() =>
  props.heroImage?.image
    ? responsiveBackgroundImageCSSVars(props.heroImage.image, CSS_VARS_PRESETS)
    : null,
);
</script>

<template>
  <div class="landing-hero">
    <div
      class="hero-background responsive-background-image"
      :style="imageCSSVars"
      role="img"
      :aria-label="heroImage?.image?.description"
      :alt="heroImage?.image?.description"
    />
    <div class="hero-content d-flex">
      <header class="mt-5 mt-xl-auto mb-md-auto">
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="hero-content-text-block"
          v-html="parseMarkdown(`# ${headline}\n${text}`)"
        />
        <!-- eslint-enable vue/no-v-html -->
        <GenericSmartLink
          v-if="cta"
          :destination="cta.url"
          class="btn btn-primary icon-chevron d-inline-flex align-items-center mt-1 mt-md-4 mb-0"
        >
          {{ cta.text }}
        </GenericSmartLink>
      </header>
      <div id="europeana-logo">
        <p class="text-uppercase mb-0">
          {{ $t("home.broughtBy") }}
          <img src="@europeana/style/img/logo.svg" alt="Europeana" />
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "assets/scss/responsive-background-image";
@import "assets/scss/variables";

.landing-hero {
  overflow: hidden;
  min-height: 100vh;
  position: relative;
  background-color: $black;

  @media (min-width: ($bp-large)) {
    height: 100vh;
    min-height: 46rem;
  }

  @media (min-width: ($bp-wqhd)) {
    min-height: 53rem;
  }

  @media (min-width: ($bp-4k)) {
    min-height: 78rem;
  }

  .hero-content {
    left: 0;
    top: 3.5rem;
    right: 0;
    bottom: 0;
    position: relative;
    margin: -3.5rem 0 0 0;
    padding: 6.5rem 2rem 90vw;
    max-width: 100%;
    flex-direction: column;

    @media (min-width: ($bp-small)) {
      padding: 8rem 5rem 62vw;
    }

    @media (min-width: ($bp-large)) {
      position: absolute;
      padding: 8rem 5rem 2rem;
    }

    @media (min-width: ($bp-wqhd)) {
      padding: 14rem 16rem; // top and bottom have slightly less spacing
    }

    @media (min-width: ($bp-4k)) {
      top: 5.125rem;
      margin: -5.125rem 0 0 0;
    }

    header {
      position: relative;
      z-index: 1;
      text-align: center;

      @media (min-width: ($bp-large)) {
        text-align: left;
      }
    }

    .hero-content-text-block {
      margin-bottom: 2rem;

      @media (min-width: ($bp-small)) {
        max-width: 70%;
        margin-left: auto;
        margin-right: auto;
      }

      @media (min-width: ($bp-medium)) {
        max-width: 36rem;
      }

      @media (min-width: ($bp-large)) {
        margin-left: 0;
      }

      @media (min-width: ($bp-extralarge)) {
        margin-bottom: auto;
        margin-top: auto;
      }

      @media (min-width: ($bp-4k)) {
        max-width: 72rem;
      }
    }

    :deep(h1) {
      color: $white;
      text-align: center;
      font-family: $font-family-montserrat;
      font-size: $font-size-12;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 1rem;

      @media (min-width: ($bp-medium)) {
        margin-bottom: 1.5rem;
        font-size: $font-size-14;
      }

      @media (min-width: ($bp-large)) {
        text-align: left;
      }

      @media (min-width: $bp-4k) {
        font-size: $font-size-28;
        margin-bottom: 4rem;
      }

      em {
        display: block;
        color: $white;
        font-style: normal;
        font-size: $font-size-24;
        font-weight: 700;
        text-transform: none;

        @media (min-width: ($bp-medium)) {
          font-size: $font-size-36;
          line-height: 1.2;
        }

        @media (min-width: $bp-4k) {
          font-size: $font-size-72;
        }
      }
    }

    :deep(p) {
      color: $white;
      text-align: center;

      @media (min-width: ($bp-medium)) {
        font-size: $font-size-20;
      }

      @media (min-width: ($bp-large)) {
        text-align: left;
      }

      @media (min-width: $bp-4k) {
        font-size: $font-size-40;
      }
    }
  }

  .hero-background {
    left: 0;
    top: 3.5rem;
    right: 0;
    bottom: 0;
    position: absolute;
    background-size: 100% auto;
    background-position: bottom;
    background-repeat: no-repeat;
    background-color: $black;

    @media (min-width: $bp-large) {
      background-size: auto 100%;
      background-position: right;
    }

    @media (min-width: $bp-extralarge) {
      background-size: auto 125%;
      background-position: right;
    }

    @media (min-width: $bp-xxxl) {
      background-size: auto 150%;
      background-position: right;
    }
  }

  #europeana-logo {
    order: -1;

    @media (min-width: ($bp-large)) {
      order: 1;
    }

    p {
      font-size: $font-size-14;
      text-align: right;

      @media (min-width: ($bp-large)) {
        text-align: left;
      }

      @media (min-width: ($bp-4k)) {
        font-size: $font-size-28;
      }
    }

    img {
      display: block;
      margin-top: 0.25rem;
      width: 100px;
      filter: invert(1);
      margin-left: auto;

      @media (min-width: ($bp-medium)) {
        margin-top: 0.75rem;
        width: 176px;
      }

      @media (min-width: ($bp-large)) {
        margin-left: 0;
      }

      @media (min-width: ($bp-4k)) {
        margin-top: 1.5rem;
        width: 440px;
      }
    }
  }
}
</style>
