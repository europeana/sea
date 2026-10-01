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
  <div>
    <ImageOptimised
      :src="image?.url"
      :width="image?.width"
      :height="image?.height"
      :content-type="image?.contentType"
      :contentful-image-crop-presets="contentfulImageCropPresets"
      :picture-source-media-resolutions="[1, 2]"
      :lazy="lazy"
      class="person-image rounded-circle"
    />
    <!-- TODO: Add fallback image / handle image not found -->
  </div>
</template>

<style lang="scss" scoped>
.person-image ::v-deep img {
  width: 7.5rem;
  height: 7.5rem;
}
</style>
