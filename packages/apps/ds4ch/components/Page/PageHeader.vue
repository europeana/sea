<script setup>
import vVisibleOnScroll from "@europeana/vue-visible-on-scroll";
import variables from "assets/scss/exports.module.scss";
const bpLarge = parseInt(variables.bpLarge);
</script>
<template>
  <header
    class="bg-dark border-bottom border-light fixed-top"
    v-visible-on-scroll="{ routeHash: $route.hash, desktopBreakpoint: bpLarge }"
  >
    <PageNavbar />
  </header>
</template>
<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

header {
  transition: transform $standard-transition;
}
</style>
