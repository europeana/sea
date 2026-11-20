<script setup>
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
});

const buttonClass = computed(() => {
  if (
    ["highlight", "alternate"].includes(
      props.backgroundImage?.profile?.background,
    )
  ) {
    return "btn-primary icon-chevron";
  } else {
    return "btn-secondary icon-chevron";
  }
});
</script>

<template>
  <LandingCallToActionBanner
    :title="props.title"
    :text="props.text"
    :link="props.link"
    :background-image="props.backgroundImage"
    :button-class="buttonClass"
  />
</template>
