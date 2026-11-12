<script setup>
// explicit import needed for dynamic components: https://nuxt.com/docs/guide/directory-structure/components#dynamic-components
import { GenericSmartLink } from "#components";

const props = defineProps({
  url: {
    type: Object,
    default: null,
  },
  info: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: "",
  },
  variant: {
    type: String,
    default: "default", // other options: dark
  },
});
const cardClass = computed(() => {
  return props.url
    ? `linked-card ${props.variant}-card`
    : `${props.variant}-card`;
});
</script>

<template>
  <div class="card text-center info-card" :class="cardClass">
    <component
      :is="url ? GenericSmartLink : 'div'"
      :destination="url"
      :link-class="url ? 'card-link' : null"
      hide-external-icon
    >
      <div v-if="image" class="card-img">
        <span :class="image" />
      </div>
      <div class="card-body">
        <div v-if="info" class="card-title">
          <span>
            {{ info }}
          </span>
        </div>
        <div class="card-text text-uppercase">
          {{ label }}
        </div>
      </div>
    </component>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "@europeana/style/scss/icon-font";

.info-card {
  background: $white;
  border-radius: $border-radius-large;
  box-shadow: none;
  color: $greyblack;
  border: none;
  transition: box-shadow 0.25s;

  &.dark-card {
    background: $lightgrey;
  }

  &.linked-card:hover {
    box-shadow: $boxshadow-small;
    transition: box-shadow 0.25s;
  }

  a {
    text-decoration: none;
  }

  .card-body {
    padding: 0.625rem 1rem 0.5rem;
  }

  .card-title {
    color: $blue;
    font-size: 1.5rem;
    line-height: 1.75rem;
    margin-bottom: 0.25rem;
  }

  .card-text {
    font-weight: 700;
    font-size: $font-size-extrasmall;
    line-height: 1.75rem;
  }

  .card-img {
    @extend %icon-font;

    font-size: 2rem;
    margin-top: 1rem;

    .ic-3d {
      &::after {
        content: "\e942";
      }
    }

    .ic-video {
      &::after {
        content: "\e943";
      }
    }

    .ic-sound {
      &::after {
        content: "\e944";
      }
    }

    .ic-text {
      &::after {
        content: "\e945";
      }
    }

    .ic-image {
      &::after {
        content: "\e946";
      }
    }
  }
}
</style>
