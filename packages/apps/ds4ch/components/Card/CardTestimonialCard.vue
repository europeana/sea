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
  /**
   * Variant to define layout and style
   * @values card, banner
   */
  variant: {
    type: String,
    default: "card",
  },
});
</script>
<template>
  <div class="card mx-auto" :class="variant">
    <div class="card-body">
      <span class="icon-quote d-block" />
      <figure>
        <blockquote class="mx-0">
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
  margin-bottom: 1.5rem;

  @media (min-width: $bp-4k) {
    font-size: $font-size-48;
    margin-bottom: 3rem;
  }
}

blockquote {
  margin-bottom: 1.5rem;

  @media (min-width: $bp-4k) {
    margin-bottom: 3rem;
  }

  p {
    font-style: normal;

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

.banner {
  max-width: 100%;
  background-color: $black;
  color: $white;
  border-radius: 0;
  margin-bottom: 3rem;

  @media (min-width: $bp-4k) {
    margin-bottom: 6rem;
  }

  .card-body {
    padding: 1rem 1rem;

    @media (min-width: $bp-medium) {
      padding: 1.75rem 2rem 1.75rem 3rem;
    }

    @media (min-width: $bp-4k) {
      padding: 3.5rem 4rem 3.5rem 6rem;
    }
  }

  .icon-quote {
    margin-bottom: 0.5rem;

    @media (min-width: $bp-4k) {
      margin-bottom: 1rem;
    }
  }

  figure {
    text-align: center;

    @media (min-width: $bp-medium) {
      text-align: left;
    }
  }

  blockquote {
    margin-bottom: 0.5rem;

    @media (min-width: $bp-4k) {
      margin-bottom: 1rem;
    }

    p {
      font-size: $font-size-20;
      font-weight: 600;
      font-style: italic;

      @media (min-width: $bp-4k) {
        font-size: $font-size-40;
      }

      &:last-child {
        margin-bottom: 0.5rem;

        @media (min-width: $bp-4k) {
          margin-bottom: 1rem;
        }
      }
    }
  }
}
</style>
