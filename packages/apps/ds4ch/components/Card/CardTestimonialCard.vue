<script setup>
const props = defineProps({
  testimonialText: {
    type: String,
    default: null,
  },
  attribution: {
    type: String,
    default: null,
  },
});
</script>
<template>
  <div class="card">
    <div class="card-body">
      <span class="icon-quote d-inline-block mb-4" />
      <figure>
        <blockquote class="mx-0 mb-4 fst-normal">
          <p>{{ props.testimonialText }}</p>
        </blockquote>
        <figcaption v-if="attribution" class="fw-semibold">
          - {{ attribution }}
        </figcaption>
      </figure>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "assets/scss/variables";

.card {
  --bs-border-width: 0;
  max-width: $max-card-width;
}

.icon-quote {
  font-size: $font-size-24;
}

blockquote {
  p:before,
  p:after {
    content: none;
  }
}
</style>
