<script setup>
const props = defineProps({
  mediaUrl: {
    type: String,
    default: "",
  },
  shareTo: {
    type: Array,
    default: () => [],
  },
});

const appConfig = useRuntimeConfig().public;
const route = useRoute();
// TODO: use canonical URL without locale here.
const shareUrl = `${appConfig.baseUrl}${route.path}`;

// TODO: pass in optional pinterest and linkedin
const networks = computed(() => {
  return [
    {
      identifier: "facebook",
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?display=page&u=${shareUrl}`,
    },
    {
      identifier: "bsky",
      name: "Bluesky",
      url: `https://bsky.app/intent/compose?text=${shareUrl}`,
    },
  ].concat(props.shareTo);
});

// TODO: add event tracking to matomo
</script>

<template>
  <div>
    <NuxtLink
      v-for="(network, index) in networks"
      :key="index"
      :class="`btn btn-secondary social-share ${network.identifier} d-inline-flex align-items-center me-2 mb-2 me-4k-3 mb-4k-4`"
      :to="network.url"
      target="_blank"
      :aria-label="$t('actions.shareOn', { social: network.name })"
    >
      <span :class="`icon-${network.identifier}`" />
      <span class="text">{{ network.name }} </span>
    </NuxtLink>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.btn.btn-secondary {
  flex-basis: 33%;

  &:last-child {
    margin-right: 0 !important;
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
  }

  [class^="icon"] {
    font-size: $font-size-base;
  }

  span.text {
    font-family: $font-family-sans-serif;
    font-weight: 600;
    padding-left: 0.75rem;
  }
}
</style>
