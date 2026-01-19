<script setup>
const { matomo } = useMatomo();

const props = defineProps({
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

const logClickLink = () => {
  matomo.value?.trackEvent("CTAs", "Click CTA", props.text);
};
</script>

<template>
  <div>
    <GenericSmartLink
      :destination="url"
      class="btn"
      :class="classes"
      hide-external-icon
      @click="logClickLink"
    >
      {{ text }}
    </GenericSmartLink>
  </div>
</template>
