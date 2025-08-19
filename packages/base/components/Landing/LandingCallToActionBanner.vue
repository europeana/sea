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
    default: () => {},
  },
  /**
   * Button class to add
   */
  buttonClass: {
    type: String,
    default: "btn-outline-primary",
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
  "4kup": { w: 3840, h: 680, fit: "fill" },
};

const backgroundImageClasses = {
  "bg-position-y-center": ["left", "right"].includes(
    props.backgroundImage?.profile?.focus,
  ),
  "bg-color-highlight":
    props.backgroundImage?.profile?.background === "highlight",
};
const imageCSSVars = computed(() => {
  if (props.backgroundImage?.image) {
    if (props.backgroundImage.image?.contentType === "image/svg+xml") {
      return { "--bg-img-small": `url('${props.backgroundImage.image.url}')` };
    } else {
      return responsiveBackgroundImageCSSVars(
        props.backgroundImage?.image,
        CSS_VARS_PRESETS,
        props.backgroundImage?.profile,
      );
    }
  } else {
    return null;
  }
});
</script>

<template>
  <div class="landing-cta position-relative">
    <div
      v-if="props.backgroundImage"
      class="background-image responsive-background-image"
      :class="backgroundImageClasses"
      :style="imageCSSVars"
    />
    <div
      class="container"
      :class="
        props.backgroundImage?.profile?.background === 'highlight'
          ? 'text-white'
          : ''
      "
    >
      <ContentPrimaryCallToAction
        :title="title"
        :text="text"
        :link="link"
        :button-variant="buttonClass"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "assets/scss/responsive-background-image";

.background-image {
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

.container {
  padding-top: 3.625rem;
  padding-bottom: 2rem;
  position: relative;

  @media (min-width: $bp-4k) {
    padding-top: 7rem;
    padding-bottom: 5rem;
  }

  .primary-cta {
    margin-left: auto !important;
    margin-right: auto !important;
    background-color: transparent !important;
    padding: 0;
    max-width: 535px !important;

    @media (min-width: $bp-large) {
      width: 100% !important;
      max-width: 960px;
    }

    @media (min-width: $bp-4k) {
      max-width: $max-text-column-width-landing-4k !important;
    }
  }

  :deep(.primary-cta-rich-text) {
    text-align: center !important;
    margin-bottom: 2rem;

    @media (min-width: $bp-4k) {
      margin-bottom: 3.125rem;
    }
  }

  &.text-white :deep(.primary-cta-rich-text a) {
    color: $white;
  }
}
</style>
