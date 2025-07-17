<script setup>
const props = defineProps({
  /**
   * Any custom classes to apply
   * to the cta.
   * @values btn-secondary, btn-primary
   */
  classes: {
    type: String,
    default: "btn-secondary",
  },
  /**
   * The URL to which the CTA
   * links
   */
  url: {
    type: String,
    required: true,
  },
  /**
   * Text to use in the CTA
   */
  text: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div>
    <GenericSmartLink
      :destination="props.url"
      class="btn btn-cta icon-chevron"
      :class="props.classes"
      hide-external-icon
    >
      {{ props.text }}
    </GenericSmartLink>
  </div>
</template>
