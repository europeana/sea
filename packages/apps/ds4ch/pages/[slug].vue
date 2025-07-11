<script setup>
const route = useRoute();
</script>
<template>
  <div>
    <h1>{{ route.fullPath }}</h1>
  </div>
</template>
