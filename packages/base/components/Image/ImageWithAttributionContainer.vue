<script setup>
defineProps({
  hero: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="container-fluid image-wrapper">
    <div class="jumbotron mt-0" :class="hero ? 'hero' : ''">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.image-wrapper {
  padding: 0;
}

.jumbotron {
  height: auto;
  background: $white;
  margin-bottom: 2rem;

  @media (min-width: $bp-medium) {
    margin-left: -1rem;
    margin-right: -1rem;
  }

  @media (min-width: $bp-large) {
    margin-left: -3rem;
    margin-right: -3rem;
  }

  &::before {
    display: none;
  }

  :deep(img) {
    height: auto;
    width: auto;
  }

  &.hero {
    min-height: initial;

    :deep(figure) {
      height: 0;
      padding-top: 56.25%;
      position: relative;
      margin: 0;
      display: flex;
      justify-content: center;
      width: 100%;

      img {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        object-fit: cover;
        width: 100%;
      }
    }
  }

  .container {
    max-width: none;
    justify-content: center;
    align-items: center;
  }
}
</style>
