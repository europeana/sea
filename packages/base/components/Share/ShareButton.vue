<script setup>
const route = useRoute();
const nuxtApp = useNuxtApp();

defineProps({
  variant: {
    type: String,
    default: "btn-secondary",
  },
});

const logModalOpen = () => {
  if (nuxtApp.vueApp?.config?.globalProperties?.$matomo) {
    nuxtApp.vueApp.config.globalProperties.$matomo.trackEvent(
      "Open modal",
      "Social share modal opened",
      `Opened share modal on ${route.path}`,
    );
  }
};
</script>

<template>
  <button
    class="btn share-button d-inline-flex align-items-center"
    :class="variant"
    data-bs-toggle="modal"
    data-bs-target="#share-modal"
    @click="logModalOpen"
  >
    <span class="icon-share d-inline-flex me-1 me-4k-3" />
    {{ $t("actions.share") }}
  </button>
</template>
