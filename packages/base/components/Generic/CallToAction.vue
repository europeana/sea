<script setup>
defineProps({
  /**
   * Any custom classes to apply
   * to the cta.
   * @values btn-secondary, btn-primary
   */
  classes: {
    type: String,
    default: "btn-primary",
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
      :destination="url"
      class="btn btn-cta"
      :class="classes"
      hide-external-icon
    >
      {{ text }}
    </GenericSmartLink>
  </div>
</template>
