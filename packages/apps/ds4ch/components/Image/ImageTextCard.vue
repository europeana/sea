<script setup>
const props = defineProps({
  /**
   * Image card
   */
  card: {
    type: Object,
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
   * Classes to set on CTA link button
   */
  ctaClasses: {
    type: String,
    default: "btn-secondary icon-chevron",
  },
  /**
   * Image sizes for responsive images
   */
  imageSizes: {
    type: String,
    default: [
      "(max-width: 575px) 512px", // bp-small
      "(max-width: 767px) 510px", // bp-medium
      "(max-width: 991px) 690px", // bp-large
      "(max-width: 1199px) 600px", // bp-xl
      "(max-width: 1399px) 700px", // bp-xxl
      "(max-width: 3019px) 625px", // bp-4k
      "1500px",
    ].join(","),
  },
  /**
   * Image srcset for responsive image crops
   */
  imageSrcSet: {
    type: Object,
    default: () => ({
      small: { w: 512, h: 342, fit: "fill" },
      medium: { w: 510, h: 340, fit: "fill" },
      large: { w: 690, h: 460, fit: "fill" },
      xl: { w: 600, h: 400, fit: "fill" },
      xxl: { w: 700, h: 467, fit: "fill" },
      "4k": { w: 625, h: 417, fit: "fill" },
      "4k+": { w: 1500, h: 1000, fit: "fill" },
    }),
  },
});
</script>
<template>
  <LandingImageCard
    :card="props.card"
    :title-tag="props.titleTag"
    :cta-classes="props.ctaClasses"
    :image-sizes="props.imageSizes"
    :image-src-set="props.imageSrcSet"
  />
</template>
<style lang="scss">
@import "@europeana/style/scss/variables";
@import "assets/scss/variables";

.image-card {
  max-width: 100%;

  @media (min-width: $bp-large) {
    padding-right: 0;
  }

  .image-wrapper {
    @media (min-width: $bp-large) {
      max-width: none;
    }

    @media (min-width: $bp-xxl) {
      flex-basis: 625px;
    }

    @media (min-width: $bp-4k) {
      flex-basis: 1500px;
    }
  }

  .text-wrapper {
    padding-right: 0;

    @media (min-width: $bp-large) {
      padding-right: 2rem;
    }

    @media (min-width: $bp-extralarge) {
      padding-right: 6rem;
    }

    @media (min-width: $bp-xxl) {
      flex-basis: 625px;
      padding-right: 0;
    }

    @media (min-width: $bp-xxl) {
      flex-basis: 625px;
    }

    @media (min-width: $bp-4k) {
      padding-right: 4rem;
      padding-left: 12rem;
      flex-basis: 1500px;
    }

    .text {
      color: $black;

      @media (min-width: $bp-4k) {
        font-size: $font-size-40;
      }
    }

    .btn {
      margin-top: 1rem;

      @media (min-width: $bp-4k) {
        margin-top: 3rem;
      }
    }
  }

  &:nth-child(even),
  &.image-card-even {
    .text-wrapper {
      @media (min-width: $bp-large) {
        order: -1;
        padding-right: 3.625rem;
        padding-left: 2rem;
      }

      @media (min-width: $bp-extralarge) {
        padding-left: 6rem;
      }
      @media (min-width: $bp-xxl) {
        padding-right: 6rem;
        padding-left: 0;
      }
    }
  }
}
</style>
