<script setup>
const props = defineProps({
  /**
   * Card title
   *
   */
  title: {
    type: String,
    required: true,
  },
  /**
   * Card subtitle
   */
  subTitle: {
    type: String,
    default: null,
  },

  /**
   * Card text
   *
   */
  text: {
    type: String,
    default: null,
  },
  /**
   * Image object with url and content type
   *
   */
  image: {
    type: Object,
    default: () => {},
  },
  /**
   * URL for the card to link to
   *
   * An object should be a Vue route
   */
  url: {
    type: [String, Object],
    default: "",
  },
});

const imageCropPresets = {
  small: { w: 545, h: 288, fit: "fill", f: "face" },
  medium: { w: 510, h: 288, fit: "fill", f: "face" },
  large: { w: 345, h: 288, fit: "fill", f: "face" },
  xl: { w: 465, h: 288, fit: "fill", f: "face" },
  xxl: { w: 555, h: 320, fit: "fill", f: "face" },
  xxxl: { w: 805, h: 320, fit: "fill", f: "face" },
  wqhd: { w: 1005, h: 480, fit: "fill", f: "face" },
  "4k": { w: 1255, h: 480, fit: "fill", f: "face" },
  "4k+": { w: 1485, h: 578, fit: "fill", f: "face" },
};
const imageSizes = [
  "(max-width: 575px) 545px", // bp-small
  "(max-width: 767px) 510px", // bp-medium
  "(max-width: 991px) 345px", // bp-large
  "(max-width: 1199px) 465px", // bp-xl
  "(max-width: 1399px) 555px", // bp-xxl
  "(max-width: 1879px) 805px", // bp-xxxl
  "(max-width: 2519px) 1005px", // bp-wqhd
  "(max-width: 3019px) 1255px", // bp-4k
  "1485px",
].join(",");
</script>

<template>
  <ContentCard
    :title="props.title"
    :sub-title="props.subTitle"
    :text="props.text"
    :url="props.url"
    :image-url="props.image?.url"
    :image-content-type="props.image?.contentType"
    :image-sizes="imageSizes"
    :contentful-image-crop-presets="imageCropPresets"
    :lazy="false"
    class="featured-content-card mw-100"
  />
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.featured-content-card {
  min-height: 10rem;
  flex: 0 1 100%;
  margin-bottom: 3rem;

  @media (min-width: $bp-4k) {
    margin-bottom: calc(var(--bp-4k-increment) * 3rem);
  }

  :deep(.card-wrapper) {
    @media (min-width: $bp-medium) {
      flex-direction: row;
    }

    @media (min-width: $bp-xxxl) {
      min-height: 20rem;
    }

    .default-thumbnail {
      aspect-ratio: 0;
    }
  }

  :deep(.card-img) {
    border-radius: $border-radius-small $border-radius-small 0 0;

    @media (min-width: $bp-medium) {
      flex: 0 0 50%;
      order: 1;
      max-height: none;
      position: relative;
      border-radius: 0 $border-radius-small $border-radius-small 0;

      img {
        height: 100%;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transition: transform 400ms linear;
      }
    }

    @media (min-width: $bp-4k) {
      border-radius: 0 $border-radius-large $border-radius-large 0;
    }
  }

  :deep(.card-body) {
    flex: 0 0 50%;
    padding: 2.625rem 1rem;
    background-color: var(--bg-primary);
    border-radius: 0 0 $border-radius-small $border-radius-small;

    @media (min-width: $bp-medium) {
      order: 0;
      padding: 2.875rem 2rem;
      border-radius: $border-radius-small 0 0 $border-radius-small;
    }

    @media (min-width: $bp-large) {
      flex: 0 0 50%;
    }

    @media (min-width: $bp-4k) {
      padding: 8.75rem 6.5rem;
      border-radius: $border-radius-large 0 0 $border-radius-large;
    }

    .card-title-texts-wrapper {
      @media (min-width: $bp-xxxl) {
        max-width: $max-text-column-width;
      }
    }

    .card-subtitle {
      background-color: $white;
      border-radius: $border-radius-small;
      color: var(--color-primary);
      padding: 0.3125rem 0.5rem;
      display: inline-block;
      margin-bottom: 1.375rem;
      font-family: var(--font-family-primary);

      @media (min-width: $bp-xxxl) {
        font-size: calc(1.25 * $font-size-extrasmall);
      }

      @media (min-width: $bp-4k) {
        border-radius: $border-radius-large;
        padding: calc(var(--bp-4k-increment) * 0.3125rem)
          calc(var(--bp-4k-increment) * 0.5rem);
        font-size: calc(var(--bp-4k-increment) * $font-size-extrasmall);
      }
    }

    .card-title {
      font-family: var(--font-family-primary);
      font-size: $font-size-medium;
      font-weight: 500;
      color: $white;
      display: inline-flex;
      flex-direction: column;
      -webkit-line-clamp: none;

      @media (min-width: $bp-xxxl) {
        font-size: calc(1.25 * $font-size-medium);
      }

      @media (min-width: $bp-4k) {
        font-size: calc(var(--bp-4k-increment) * $font-size-xl);
      }

      a {
        color: $white;
      }
    }

    .card-text {
      color: $white;
      font-size: $font-size-base;
      line-height: 1.5;

      @media (min-width: $bp-xxxl) {
        font-size: calc(1.25 * $font-size-base);
      }

      @media (min-width: $bp-4k) {
        font-size: calc(var(--bp-4k-increment) * $font-size-base);
      }

      p {
        -webkit-line-clamp: 2;
      }
    }
  }

  &:hover {
    :deep(.card-img) {
      img {
        transform: scale(1.05);
        transition: transform 400ms linear;
      }
    }
  }
}
</style>
