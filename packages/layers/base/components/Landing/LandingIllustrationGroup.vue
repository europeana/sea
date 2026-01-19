<script setup>
import parseMarkdown from "~/utils/markdown/parse.js";
import useSwiper from "~/composables/swiper";
import "swiper/css/grid"; // for mobile
import { A11y, Grid, Keyboard, Navigation, Pagination } from "swiper/modules";
import { GenericSmartLink } from "#components"; // explicit import needed for dynamic components: https://nuxt.com/docs/guide/directory-structure/components#dynamic-components

const { t } = useI18n();

defineProps({
  /**
   * Heading title to display above the illustrations
   */
  title: {
    type: String,
    default: null,
  },
  /**
   * Text to display under title and above the illustrations
   */
  text: {
    type: String,
    default: null,
  },
  /**
   * Heading title level to use. Override default for when used in subsection to keep correct heading structure.
   */
  titleTag: {
    type: String,
    default: "h2",
  },
  /**
   * List of illustrations
   */
  illustrations: {
    type: Array,
    default: () => [],
  },
});

const SRCSET_PRESETS = {
  large: { w: 98, h: 98 },
  "4k": { w: 127, h: 127 },
  "4k+": { w: 340, h: 340 },
};

const imageSizes = [
  "(max-width: 991px) 98px", // bp-large
  "(max-width: 3019px) 127px", // bp-4k
  "340px",
].join(",");

const swiperOptions = {
  modules: [A11y, Grid, Keyboard, Navigation, Pagination],
  a11y: {
    paginationBulletMessage: t("swiper.a11y.paginationBulletGroupedSlides", {
      page: "{{index}}",
    }),
  },
  centerInsufficientSlides: true,
  grid: {
    fill: "row",
    rows: 2,
  },
  lazyPreloadPrevNext: 4,
  slidesPerGroup: 2,
  slidesPerView: 2,
  speed: 600,
  breakpoints: {
    768: {
      grid: {
        rows: 1,
      },
      slidesPerGroup: 4,
      slidesPerView: 4,
    },
    3020: {
      grid: {
        rows: 1,
      },
      slidesPerGroup: 5,
      slidesPerView: 5,
    },
  },
};

const { swiperReady } = useSwiper(swiperOptions);
</script>

<template>
  <div class="container landing-illustration-group">
    <div class="header col-lg-8 text-center mx-auto px-0">
      <component :is="titleTag">
        {{ title }}
      </component>
      <!-- eslint-disable vue/no-v-html -->
      <div v-if="text" class="text mb-3" v-html="parseMarkdown(text)" />
      <!-- eslint-enable vue/no-v-html -->
    </div>
    <div
      class="swiper-container-wrapper"
      :class="{ paginated: illustrations.length > 4 }"
    >
      <div v-show="swiperReady" class="swiper swiper-container">
        <div class="swiper-wrapper">
          <div
            v-for="(slide, i) in illustrations"
            :key="i"
            :index="i"
            class="swiper-slide text-center"
          >
            <component
              :is="slide.url ? GenericSmartLink : 'div'"
              :destination="slide.url"
              class="image-wrapper"
            >
              <ImageOptimised
                :src="slide.image.url"
                :contentful-image-crop-presets="SRCSET_PRESETS"
                :image-sizes="imageSizes"
                :width="slide.image.width"
                :height="slide.image.height"
                :max-width="254"
                :alt="slide.name || ''"
                class="swiper-lazy"
              />
            </component>
          </div>
        </div>
      </div>
      <div v-if="illustrations.length > 4" class="swiper-pagination" />
      <div v-show="illustrations.length > 4" class="swiper-button-prev" />
      <div v-show="illustrations.length > 4" class="swiper-button-next" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "assets/scss/variables";
@import "@europeana/style/scss/responsive-background-image";

.container {
  margin-top: 3rem;
  margin-bottom: 3rem;
  padding-left: 0;
  padding-right: 0;

  @media (min-width: $bp-large) {
    margin-top: 6rem;
    margin-bottom: 6rem;
  }

  @media (min-width: $bp-4k) {
    margin-top: 15rem;
    margin-bottom: 15rem;
  }
}

.header {
  padding-bottom: 1rem;

  @media (min-width: $bp-xxl) {
    max-width: $max-text-column-width;
  }

  .text {
    color: $darkgrey;
  }
}

$swiper-slide-width-height: 98px;
$swiper-slide-width-height-large: 127px;
$swiper-slide-width-height-4k: calc(2 * $swiper-slide-width-height-large);
$swiper-pagination-height: 56.5px;
$swiper-pagination-height-large: 88.5px;
$swiper-pagination-height-4k: 124px;

.swiper-container-wrapper {
  margin: 0 auto;
  position: relative;
  height: calc(
    2 * $swiper-slide-width-height
  ); // Set a fixed height to prevent layout shift

  &.paginated {
    height: calc((2 * $swiper-slide-width-height) + $swiper-pagination-height);
  }

  @media (min-width: $bp-medium) {
    width: 100%;
    height: $swiper-slide-width-height;

    &.paginated {
      height: calc($swiper-slide-width-height + $swiper-pagination-height);
    }
  }

  @media (min-width: $bp-large) {
    width: 873px;
    height: $swiper-slide-width-height-large;

    &.paginated {
      height: calc(
        $swiper-slide-width-height-large + $swiper-pagination-height-large
      );
    }
  }

  @media (min-width: $bp-4k) {
    width: 100%;
    height: $swiper-slide-width-height-4k;

    &.paginated {
      height: calc(
        $swiper-slide-width-height-4k + $swiper-pagination-height-4k
      );
    }
  }
}

.swiper-container {
  width: 100%;

  @media (min-width: $bp-medium) {
    width: calc(100% - 101px);
  }

  .image-wrapper {
    width: $swiper-slide-width-height;
    height: $swiper-slide-width-height;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    @media (min-width: $bp-large) {
      width: $swiper-slide-width-height-large;
      height: $swiper-slide-width-height-large;
    }

    @media (min-width: $bp-4k) {
      width: $swiper-slide-width-height-4k;
      height: $swiper-slide-width-height-4k;
    }

    :deep(picture) {
      width: 100%;
      height: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    :deep(img) {
      mix-blend-mode: multiply; // fixes logo img with white background
      max-height: 100%;
      height: auto;
      width: auto;
    }

    :deep(.icon-external-link) {
      display: none;
    }
  }
}

.swiper-button-prev,
.swiper-button-next {
  display: none;
  height: 48px;
  width: 48px;
  color: $black;
  background: $lightgrey;
  border-radius: 50%;
  top: calc(50% - 2rem);

  @media (min-width: $bp-medium) {
    display: flex;
  }

  @media (min-width: $bp-large) {
    top: calc(50% - 3rem);
  }

  &:after {
    font-size: 1.25rem;
    font-weight: 700;
  }

  @media (min-width: $bp-4k) {
    height: 96px;
    width: 96px;
    top: calc(50% - 5rem);

    &:after {
      font-size: 2.5rem;
    }
  }
}

.swiper-button-prev::after {
  padding-right: 2px;
}

.swiper-button-next::after {
  padding-left: 2px;
}

.swiper-pagination {
  width: 100%;
  margin-top: 2rem;
  position: relative;

  @media (min-width: $bp-large) {
    margin-top: 4rem;
  }
}

:deep(.swiper-pagination-bullet) {
  height: 12px;
  width: 12px;
  color: $black;
  background-color: transparent;
  border: 2px solid $black;
  opacity: 1;
  margin-right: 6px;

  @media (min-width: $bp-4k) {
    height: 24px;
    width: 24px;
    margin-right: 12px;
    border-width: 4px;
  }

  &:hover {
    cursor: pointer;
  }

  &:last-child {
    margin-right: 0;
  }

  &.swiper-pagination-bullet-active {
    background-color: $black;
  }
}
</style>
