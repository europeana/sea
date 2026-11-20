<script setup>
defineProps({
  error: {
    type: [String, Object, Error],
    default: "",
  },
});
</script>
<template>
  <div class="alert alert-dark mt-3" role="alert" data-qa="error notice">
    <strong>{{ $t("error") }}:</strong> {{ error?.message || error }}
  </div>
</template>
