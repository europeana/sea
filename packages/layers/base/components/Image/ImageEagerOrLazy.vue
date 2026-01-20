<!-- TODO: test if native lazy loading is handled sufficiently by modern browsers. Else, use a library or IntersectionObserver -->
<script setup>
const props = defineProps({
  alt: {
    type: String,
    default: null,
  },

  height: {
    type: [Number, String],
    required: true,
  },

  lazy: {
    type: Boolean,
    default: false,
  },

  sizes: {
    type: String,
    default: null,
  },

  src: {
    type: String,
    required: true,
  },

  srcset: {
    type: String,
    default: null,
  },

  width: {
    type: [Number, String],
    required: true,
  },
});
</script>
<template>
  <img
    :alt="props.alt"
    :src="props.src"
    :srcset="props.srcset"
    :sizes="props.sizes"
    :width="props.width"
    :height="props.height"
    :loading="props.lazy ? 'lazy' : 'eager'"
  />
</template>
