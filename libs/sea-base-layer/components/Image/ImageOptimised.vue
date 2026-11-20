<script setup>
import {
  isValidUrl,
  optimisedSrc,
  responsiveImageSrcset,
} from "../../utils/contentful/assets.js";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  width: {
    type: [Number, String],
    required: true,
  },
  height: {
    type: [Number, String],
    required: true,
  },
  alt: {
    type: String,
    default: "",
  },
  contentType: {
    // TODO: required?
    type: String,
    default: null,
  },
  quality: {
    type: Number,
    default: 80,
  },
  maxWidth: {
    type: Number,
    default: null,
  },
  lazy: {
    type: Boolean,
    default: true,
  },
  contentfulImageCropPresets: {
    type: Object,
    default: null,
  },
  contentfulImageDisplayProfile: {
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
});

const isContentfulAsset = isValidUrl(props.src) || false;

const aspectRatio = computed(() => {
  return props.width / props.height;
});

const optimisedWidth = computed(() => {
  return props.maxWidth === null || props.width <= props.maxWidth
    ? props.width
    : props.maxWidth;
});

const optimisedHeight = computed(() => {
  return Math.round(optimisedWidth.value / aspectRatio.value);
});

const optimisedImageSrc = computed(() => {
  return optimisedSrc(
    { url: props.src, contentType: props.contentType },
    { w: props.maxWidth, q: props.quality },
  );
});

const isSVG = props.contentType === "image/svg+xml";

const responsiveImageSrcsets = computed(() => {
  if (
    isSVG ||
    !isContentfulAsset ||
    !props.contentfulImageCropPresets ||
    (props.contentfulImageDisplayProfile &&
      !props.contentfulImageDisplayProfile.sizes)
  ) {
    return null;
  }

  return props.pictureSourceMediaResolutions.map((resolution) => {
    const resolutionSizes = Object.keys(
      props.contentfulImageCropPresets,
    ).reduce((memo, key) => {
      memo[key] = {
        ...props.contentfulImageCropPresets[key],
        w: props.contentfulImageCropPresets[key].w * resolution,
        h: props.contentfulImageCropPresets[key].h * resolution,
        q: props.quality,
      };
      return memo;
    }, {});

    return responsiveImageSrcset(
      { contentType: props.contentType, url: props.src },
      resolutionSizes,
      props.contentfulImageDisplayProfile,
    );
  });
});
</script>

<template>
  <picture v-if="responsiveImageSrcsets">
    <template v-for="(srcset, index) in responsiveImageSrcsets">
      <source
        v-if="index > 0"
        :key="index"
        :srcset="srcset"
        :sizes="props.imageSizes"
        :media="`(resolution: ${index + 1}x)`"
      />
    </template>
    <ImageEagerOrLazy
      :alt="alt"
      :height="optimisedHeight"
      :lazy="props.lazy"
      :sizes="props.imageSizes"
      :src="optimisedImageSrc"
      :srcset="responsiveImageSrcsets[0]"
      :width="optimisedWidth"
    />
  </picture>
  <ImageEagerOrLazy
    v-else
    :alt="alt"
    :height="optimisedHeight"
    :lazy="props.lazy"
    :sizes="props.imageSizes"
    :src="optimisedImageSrc"
    :width="optimisedWidth"
  />
</template>
