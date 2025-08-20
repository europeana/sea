<template>
  <div class="landing-illustration-group-container">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@import "assets/scss/variables";
@import "@europeana/style/scss/responsive-background-image";

.landing-illustration-group-container :deep(.landing-illustration-group) {
  @media (min-width: $bp-4k) {
    margin-top: 15rem;
    margin-bottom: 15rem;
  }

  .header {
    @media (min-width: $bp-4k) {
      max-width: $max-text-column-width-landing-4k !important;
      padding-bottom: 5rem;
    }
  }

  h2 {
    @media (min-width: $bp-4k) {
      margin-bottom: 2rem;
    }
  }

  .text {
    color: $black;

    @media (min-width: $bp-4k) {
      font-size: 2.5rem;
      margin-bottom: 3.125rem;
    }
  }

  $swiper-slide-width-height-4k: 340px;
  $swiper-pagination-height-4k: 126px;

  .swiper-container-wrapper {
    @media (min-width: $bp-4k) {
      height: $swiper-slide-width-height-4k;

      &.paginated {
        height: calc(
          $swiper-slide-width-height-4k + $swiper-pagination-height-4k
        );
      }
    }
  }
  .swiper-container {
    .image-wrapper {
      @media (min-width: $bp-4k) {
        width: $swiper-slide-width-height-4k;
        height: $swiper-slide-width-height-4k;
      }
    }
  }

  .swiper-button-prev,
  .swiper-button-next {
    @media (min-width: $bp-4k) {
      height: 128px;
      width: 128px;

      &:after {
        font-size: 3.5rem;
      }
    }
  }

  .swiper-pagination {
    @media (min-width: $bp-4k) {
      margin-top: 4rem;
    }
  }

  :deep(.swiper-pagination-bullet) {
    @media (min-width: $bp-4k) {
      height: 32px;
      width: 32px;
      border: 4px solid $black;
    }
  }
}
</style>
