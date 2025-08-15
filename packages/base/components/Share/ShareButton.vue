<script setup>
defineProps({
  variant: {
    type: String,
    default: "btn-secondary",
  },
});
</script>

<template>
  <!-- TODO: needs to trigger modal show on click -->
  <button
    class="btn share-button d-inline-flex align-items-center"
    :class="variant"
  >
    <span class="icon-share d-inline-flex me-1 me-4k-3" />
    {{ $t("actions.share") }}
  </button>
</template>
