<script setup>
import vVisibleOnScroll from "@europeana/vue-visible-on-scroll";
</script>
<template>
  <header
    class="bg-dark border-bottom border-light fixed-top"
    v-visible-on-scroll="$route.hash"
  >
    <PageNavbar />
  </header>
</template>
<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

header {
  transition: $standard-transition;
}
</style>
