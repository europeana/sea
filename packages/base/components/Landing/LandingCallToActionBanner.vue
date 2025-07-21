<script setup>
import { responsiveBackgroundImageCSSVars } from "../../utils/contentful/assets.js";

const props = defineProps({
  /**
   * Title
   */
  title: {
    type: String,
    default: null,
  },
  /**
   * Text to display under title
   */
  text: {
    type: String,
    default: null,
  },
  /**
   * Link Object
   */
  link: {
    type: Object,
    default: null,
  },
  /**
   * Background image Object
   */
  backgroundImage: {
    type: Object,
    default: null,
  },
  /**
   * Banner variant to use,
   * affects text colour and button style.
   * @values primary, secondary
   */
  variant: {
    type: String,
    default: "primary",
  },
  /**
   * Button variant to use,
   * overides banner button default.
   * @values secondary, primary
   */
  buttonVariant: {
    type: String,
    default: null,
  },
});

const CSS_VARS_PRESETS = {
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

const backgroundImageClasses = {
  "no-overlay":
    props.backgroundImage?.profile && !this.backgroundImage.profile.overlay,
  "bg-position-y-center": ["left", "right"].includes(
    props.backgroundImage?.profile?.focus,
  ),
  "bg-color-highlight":
    props.backgroundImage?.profile?.background === "highlight",
};
const imageCSSVars =
  props.backgroundImage?.image &&
  responsiveBackgroundImageCSSVars(
    props.backgroundImage?.image,
    CSS_VARS_PRESETS,
    props.backgroundImage?.profile,
  );

const btnClass = computed(() => {
  if (props.buttonVariant) {
    return `btn-${props.buttonVariant} icon-chevron`;
  }
  return props.variant === "primary"
    ? "btn-secondary icon-chevron"
    : "btn-primary icon-chevron";
});
</script>

<template>
  <div class="landing-cta">
    <div
      v-if="props.backgroundImage"
      class="background-image responsive-backround-image"
      :class="backgroundImageClasses"
      :style="imageCSSVars"
    />
    <div class="container" :class="variant === 'secondary' ? 'text-white' : ''">
      <ContentPrimaryCallToAction
        :title="title"
        :text="text"
        :link="link"
        :button-variant="btnClass"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.image-card {
  margin-bottom: 3rem;
  margin-left: auto;
  margin-right: auto;
  text-align: center;

  @media (min-width: $bp-medium) {
    align-items: center;
  }

  @media (min-width: $bp-large) {
    text-align: left;
    max-width: 1250px;
    margin-bottom: 6rem;

    &:nth-child(even),
    &.image-card-even {
      .text-wrapper {
        order: -1;
        padding-right: 3.625rem;
        padding-left: 2rem;

        @media (min-width: $bp-extralarge) {
          padding-left: 6rem;
        }

        @media (min-width: $bp-4k) {
          padding-right: 6rem;
        }
      }
    }
  }

  @media (min-width: $bp-4k) {
    max-width: 2500px;
    margin-bottom: 15rem;
  }

  .image-wrapper {
    margin-bottom: 1rem;

    @media (min-width: $bp-large) {
      flex: 0 0 49%;
      margin-bottom: 0;
    }
  }

  .text-wrapper {
    @media (min-width: $bp-large) {
      flex: 0 0 51%;
      background-color: $white;
      padding-left: 3.625rem;
      padding-right: 2rem;
    }

    @media (min-width: $bp-extralarge) {
      padding-right: 6rem;
    }

    @media (min-width: $bp-4k) {
      padding-left: 6rem;
    }
  }

  &.bg-color-alternate,
  .image-card-container-wrapper &.bg-color-alternate {
    background-color: $lightgrey;
    margin-top: 0;
    margin-bottom: 0;

    padding-top: 3rem;
    padding-bottom: 3rem;

    @media (min-width: $bp-large) {
      padding-top: 6rem;
      padding-bottom: 6rem;
    }

    @media (min-width: $bp-4k) {
      padding-top: 15rem;
      padding-bottom: 15rem;
    }

    .text-wrapper {
      background-color: $lightgrey;
    }
  }

  :deep figure {
    margin: 0;
    width: 100%;
    height: auto;
  }

  figure.svg-image {
    width: 100%;
    height: auto;

    :deep img {
      width: 100%;
      height: auto;
    }
  }

  .title {
    text-align: center;

    @media (min-width: $bp-large) {
      text-align: left;
    }
  }

  .text {
    color: $darkgrey;
    text-align: left;
  }
}
</style>
