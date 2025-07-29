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
  <div class="card mx-auto">
    <div class="card-body">
      <span class="icon-quote d-inline-block mb-4 mb-4k-5" />
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

  @media (min-width: $bp-4k) {
    max-width: 35rem;
  }

  .card-body {
    padding: 0;

    @media (min-width: $bp-medium) {
      padding: 1rem;
    }
  }
}

.icon-quote {
  font-size: $font-size-24;

  @media (min-width: $bp-4k) {
    font-size: $font-size-48;
  }
}

blockquote {
  p {
    @media (min-width: $bp-4k) {
      font-size: $font-size-32;
    }

    &:before,
    &:after {
      content: none;
    }
  }
}

figcaption {
  @media (min-width: $bp-4k) {
    font-size: $font-size-32;
  }
}
</style>
