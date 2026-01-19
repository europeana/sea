<script setup>
const { matomo } = useMatomo();

defineProps({
  variant: {
    type: String,
    default: "btn-secondary",
  },
});

const logClickButton = () => {
  matomo.value?.trackEvent("CTAs", "Click CTA", "Share");
};
</script>

<template>
  <button
    class="btn share-button d-inline-flex align-items-center"
    :class="variant"
    data-bs-toggle="modal"
    data-bs-target="#share-modal"
    @click="logClickButton"
  >
    <span class="icon-share d-inline-flex me-1 me-4k-3" />
    {{ $t("actions.share") }}
  </button>
</template>
