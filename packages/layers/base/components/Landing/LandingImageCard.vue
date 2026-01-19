<script setup>
import parseMarkdown from "../../utils/markdown/parse.js";

const props = defineProps({
  /**
   * Image card
   */
  card: {
    type: Object,
    default: null,
  },
  /**
   * Heading title level to use. Override default for when used in subsection to keep correct heading structure.
   */
  titleTag: {
    type: String,
    default: "h2",
  },
  ctaClasses: {
    type: String,
    default: "btn-outline-primary",
  },
  imageSizes: {
    type: String,
    default: [
      "(max-width: 575px) 512px", // bp-small
      "(max-width: 767px) 510px", // bp-medium
      "(max-width: 991px) 690px", // bp-large
      "(max-width: 1199px) 465px", // bp-xl
      "(max-width: 3019px) 625px", // bp-4k
      "1225px",
    ].join(","),
  },
  imageSrcSet: {
    type: Object,
    default: () => ({
      small: { w: 512, h: 342, fit: "fill" },
      medium: { w: 510, h: 340, fit: "fill" },
      large: { w: 690, h: 460, fit: "fill" },
      xl: { w: 465, h: 310, fit: "fill" },
      "4k": { w: 625, h: 417, fit: "fill" },
      "4k+": { w: 1225, h: 700, fit: "fill" },
    }),
  },
});

const imagecard = ref(null);

const cardClasses = [];
if (props.card?.profile?.background) {
  cardClasses.push(`bg-color-${props.card.profile.background}`);
}
if (props.card?.parity) {
  cardClasses.push(`image-card-${props.card.parity}`);
}

const cardImageWithAttribution = props.card?.image;
const isSVG = cardImageWithAttribution?.image?.contentType === "image/svg+xml";
</script>

<template>
  <div
    ref="imagecard"
    class="image-card d-lg-flex justify-content-center"
    :class="cardClasses"
  >
    <div
      v-if="cardImageWithAttribution && cardImageWithAttribution.image"
      class="image-wrapper d-lg-flex align-items-end"
    >
      <ImageWithAttribution
        class="image"
        :class="{ 'svg-image': isSVG }"
        :alt="cardImageWithAttribution.image.description || ''"
        :src="cardImageWithAttribution.image.url"
        :width="612"
        :height="365"
        :content-type="cardImageWithAttribution.image.contentType"
        :attribution="cardImageWithAttribution"
        :contentful-image-crop-presets="isSVG ? null : imageSrcSet"
        :contentful-image-display-profile="card?.profile"
        :image-sizes="isSVG ? null : imageSizes"
      />
    </div>
    <div class="text-wrapper">
      <component :is="titleTag" class="title">
        {{ card.name }}
      </component>
      <!-- eslint-disable vue/no-v-html -->
      <div class="text" v-html="parseMarkdown(card.text)" />
      <!-- eslint-enable vue/no-v-html -->
      <GenericCallToAction
        v-if="card.link"
        :url="card.link.url"
        :text="card.link.text"
        :classes="ctaClasses"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import "@europeana/style/scss/variables";

.image-card {
  margin-bottom: 3rem;
  margin-left: auto;
  margin-right: auto;
  text-align: center;

  @media (min-width: $bp-medium) {
    align-items: center;
  }

  @media (min-width: $bp-large) {
    text-align: left;
    max-width: 1250px;
    margin-bottom: 6rem;

    &:nth-child(even),
    &.image-card-even {
      .text-wrapper {
        order: -1;
        padding-right: 3.625rem;
        padding-left: 2rem;

        @media (min-width: $bp-extralarge) {
          padding-left: 6rem;
        }

        @media (min-width: $bp-4k) {
          padding-right: 6rem;
        }
      }
    }
  }

  @media (min-width: $bp-4k) {
    max-width: 2500px;
    margin-bottom: 15rem;
  }

  .image-wrapper {
    margin-bottom: 1rem;

    @media (min-width: $bp-large) {
      flex: 0 0 49%;
      margin-bottom: 0;
    }
  }

  .text-wrapper {
    @media (min-width: $bp-large) {
      flex: 0 0 51%;
      padding-left: 3.625rem;
      padding-right: 2rem;
    }

    @media (min-width: $bp-extralarge) {
      padding-right: 6rem;
    }

    @media (min-width: $bp-4k) {
      padding-left: 6rem;
    }
  }

  &.bg-color-alternate,
  .image-card-container-wrapper &.bg-color-alternate {
    background-color: $lightgrey;
    .text-wrapper {
      background-color: $lightgrey;
    }
  }

  &.bg-color-alternate,
  &.bg-color-highlight,
  .image-card-container-wrapper &.bg-color-alternate,
  .image-card-container-wrapper &.bg-color-highlight {
    margin-top: 0;
    margin-bottom: 0;

    padding-top: 3rem;
    padding-bottom: 3rem;

    @media (min-width: $bp-large) {
      padding-top: 6rem;
      padding-bottom: 6rem;
    }

    @media (min-width: $bp-4k) {
      padding-top: 15rem;
      padding-bottom: 15rem;
    }
  }

  figure {
    margin: 0;
    width: 100%;
    height: auto;

    img {
      width: 100%;
      height: auto;
    }
  }

  figcaption {
    @media (min-width: $bp-4k) {
      .icon-info {
        width: 3.125rem;
        height: 3.125rem;

        &::before {
          font-size: 3.125rem;
        }
      }

      cite {
        padding: 1.5rem;

        p {
          margin-bottom: 0.5rem;
        }

        p,
        [class^="icon-"],
        .attribution > span .license {
          font-size: 1.75rem;
        }
      }
    }
  }

  .title {
    text-align: center;

    @media (min-width: $bp-large) {
      text-align: left;
    }
  }

  .text {
    text-align: left;
  }
}
</style>
