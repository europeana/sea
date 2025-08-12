<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  width: {
    type: [Number, String],
    default: 550,
  },
  height: {
    type: [Number, String],
    default: 790,
  },
  alt: {
    type: String,
    default: "",
  },
  contentType: {
    type: String,
    default: null,
  },
  attribution: {
    type: Object,
    required: true,
  },
  maxWidth: {
    type: [Number, null],
    default: 1100,
  },
  contentfulImageDisplayProfile: {
    type: Object,
    default: null,
  },
  contentfulImageCropPresets: {
    type: Object,
    default: null,
  },
  pictureSourceMediaResolutions: {
    type: Array,
    default: () => [1],
  },
  imageSizes: {
    type: String,
    default: null,
  },
  lazy: {
    type: Boolean,
    default: true,
  },
});
</script>
<template>
  <figure>
    <ImageLottiePlayer
      v-if="props.src && props.contentType === 'application/json'"
      :src="props.src"
    />
    <ImageOptimised
      v-else-if="props.src"
      ref="image"
      :src="props.src"
      :width="props.width"
      :height="props.height"
      :alt="props.alt"
      :content-type="props.contentType"
      :max-width="props.maxWidth"
      data-qa="image"
      :image-sizes="props.imageSizes"
      :contentful-image-crop-presets="props.contentfulImageCropPresets"
      :contentful-image-display-profile="props.contentfulImageDisplayProfile"
      :picture-source-media-resolutions="props.pictureSourceMediaResolutions"
      :lazy="props.lazy"
    />
    <ImageAttributionToggle :attribution="props.attribution" />
  </figure>
</template>
