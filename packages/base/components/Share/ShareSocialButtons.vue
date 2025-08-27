<script setup>
const props = defineProps({
  // Array of network strings to add to the modal
  shareTo: {
    type: Array,
    default: () => ["bluesky", "facebook"],
  },
});

const appConfig = useRuntimeConfig().public;
const route = useRoute();
// TODO: use canonical URL without locale when canonicalUrl composable is available.
const shareUrl = `${appConfig.baseUrl}${route.path}`;

const allNetworks = {
  linkedin: {
    identifier: "linkedin",
    name: "LinkedIn",
    url: `https://www.linkedin.com/shareArticle?url=${shareUrl}`,
  },
  bluesky: {
    identifier: "bsky",
    name: "Bluesky",
    url: `https://bsky.app/intent/compose?text=${shareUrl}`,
  },
  facebook: {
    identifier: "facebook",
    name: "Facebook",
    url: `https://www.facebook.com/sharer/sharer.php?display=page&u=${shareUrl}`,
  },
};
// TODO: pass in optional pinterest and linkedin
const networks = computed(() => {
  return props.shareTo.map((network) => allNetworks[network]);
});

// TODO: add event tracking to matomo
</script>

<template>
  <NuxtLink
    v-for="(network, index) in networks"
    :key="index"
    :class="`btn btn-secondary social-share ${network.identifier} d-inline-flex align-items-center me-sm-2 mb-2 me-4k-4 mb-4k-4`"
    :to="network.url"
    target="_blank"
    :aria-label="$t('actions.shareOn', { social: network.name })"
  >
    <span :class="`icon-${network.identifier}`" />
    <span class="text">{{ network.name }} </span>
  </NuxtLink>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.btn.btn-secondary {
  flex-basis: 33%;

  &:last-child {
    margin-right: 0 !important;
  }

  [class^="icon"] {
    font-size: $font-size-extrasmall;
    align-items: center;
    background-color: $white;
    border-radius: 50%;
    display: flex;
    height: 1.125rem;
    justify-content: center;
    width: 1.125rem;

    @media (min-width: $bp-4k) {
      font-size: $font-size-large;
      height: 2.25rem;
      width: 2.25rem;
    }
  }

  &.facebook {
    $facebook-blue: #0866ff;
    border: solid 1px $facebook-blue;
    background-color: $facebook-blue;
    color: $white;

    &:not(:disabled):not(.disabled) {
      &:active,
      &.active {
        color: $white;
        background-color: $facebook-blue;
        border-color: $facebook-blue;
      }
    }

    .icon-facebook {
      background-color: $facebook-blue;
      color: $white;
      font-size: 1.125rem;

      @media (min-width: $bp-4k) {
        font-size: 2.25rem;
      }
    }
  }

  &.bsky {
    $bsky-blue: #0085ff;
    border: solid 1px $bsky-blue;
    color: $white;
    background-color: $bsky-blue;

    &:not(:disabled):not(.disabled) {
      &:active,
      &.active {
        color: $white;
        background-color: $bsky-blue;
        border-color: $bsky-blue;
      }
    }

    .icon-bsky {
      color: $bsky-blue;
    }
  }

  &.linkedin {
    $linkedin-blue: #0072b1;
    border: solid 1px $linkedin-blue;
    background-color: $linkedin-blue;
    color: $white;

    &:not(:disabled):not(.disabled) {
      &:active,
      &.active {
        color: $white;
        background-color: $linkedin-blue;
        border-color: $linkedin-blue;
      }
    }

    .icon-linkedin {
      color: $linkedin-blue;
    }
  }

  span.text {
    font-family: $font-family-sans-serif;
    font-weight: 600;
    padding-left: 0.75rem;
  }
}
</style>
