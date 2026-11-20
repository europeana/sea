<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  organisation: {
    type: String,
    default: "",
  },
  url: {
    type: String,
    default: "",
  },
});
</script>
<template>
  <address>
    <GenericSmartLink v-if="url" :destination="url" class="fw-bold">
      {{ name }}
    </GenericSmartLink>
    <span v-else>{{ name }}</span>
    <span v-if="organisation"> ({{ organisation }})</span>
  </address>
</template>
