<script setup>
defineProps({
  /**
   * Image object
   * Expected props: url, width, height, contentType
   */
  image: {
    type: Object,
    default: null,
  },
  /**
   * Name of the person
   */
  name: {
    type: String,
    default: null,
  },
  /**
   * Role of the person
   */
  role: {
    type: String,
    default: null,
  },
  /**
   * If `true`, image will be lazy-loaded
   */
  lazy: {
    type: Boolean,
    default: true,
  },
});

const contentfulImageCropPresets = {
  small: { w: 120, h: 120, fit: "fill", f: "face", r: 100 },
};
</script>

<template>
  <div class="person-card text-center">
    <ImageOptimised
      :src="image?.url"
      :width="image?.width"
      :height="image?.height"
      :content-type="image?.contentType"
      :contentful-image-crop-presets="contentfulImageCropPresets"
      :picture-source-media-resolutions="[1, 2]"
      :lazy="lazy"
      class="person-image"
    />
    <!-- TODO: Add fallback image / handle image not found -->
    <p v-if="name" class="person-name mb-1 mb-4k-2">{{ name }}</p>
    <p v-if="role" class="person-role mb-0">{{ role }}</p>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.person-card {
  width: 10.25rem;

  @media (min-width: $bp-medium) {
    width: 14.375rem;
  }

  @media (min-width: $bp-4k) {
    width: calc(var(--bp-4k-increment) * 14.375rem);
  }
}

.person-name {
  font-weight: 600;
  font-size: $font-size-base;

  @media (min-width: $bp-4k) {
    font-size: calc(var(--bp-4k-increment) * $font-size-base);
  }
}

.person-role {
  color: $darkgrey;
  font-size: $font-size-small;
  text-transform: uppercase;

  @media (min-width: $bp-4k) {
    font-size: calc(var(--bp-4k-increment) * $font-size-small);
  }
}

.person-image {
  ::v-deep img {
    width: 7.5rem;
    height: 7.5rem;
    margin-bottom: 0.875rem;

    @media (min-width: $bp-4k) {
      width: calc(var(--bp-4k-increment) * 7.5rem);
      height: calc(var(--bp-4k-increment) * 7.5rem);
      margin-bottom: calc(var(--bp-4k-increment) * 0.875rem);
    }
  }
}
</style>
