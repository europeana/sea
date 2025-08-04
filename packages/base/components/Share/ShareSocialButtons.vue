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

const appConfig = useAppConfig();
const router = useRouter();
// TODO: use canonical URL without locale here.
const shareUrl = `${appConfig.baseUrl}${router.path}`;

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
    {
      identifier: "pinterest",
      name: "Pinterest",
      url:
        `https://pinterest.com/pin/create/link/?url=${shareUrl}` +
        (props.mediaUrl ? `&media=${props.mediaUrl}` : ""),
    },
  ].concat(props.shareTo);
});

// TODO: add event tracking to matomo
</script>

<template>
  <div>
    <button
      v-for="(network, index) in networks"
      :key="index"
      v-b-tooltip.bottom
      :title="network.tooltip || ''"
      :class="`social-share mr-2 ${network.identifier}`"
      :data-qa="`share ${network.identifier} button`"
      :href="network.url"
      target="_blank"
      variant="outline-primary"
      :aria-label="$t('actions.shareOn', { social: network.name })"
    >
      <span :class="`icon-${network.identifier}`" />
      <span class="text">{{ network.name }} </span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.btn {
  align-items: center;
  display: inline-flex;
  width: calc(100% / 3 - 10px);

  @media (max-width: $bp-small) {
    width: 100%;
    margin-bottom: 10px;
  }

  @media (min-width: $bp-4k) {
    width: calc(100% / 3 - 15px);
    margin-bottom: 15px;
    margin-right: 0.75rem !important;
  }

  &:hover {
    background: $white;
  }

  &:last-child {
    margin-right: 0 !important;
  }

  &.facebook {
    $facebook-blue: #0866ff;

    border: solid 1px $facebook-blue;
    color: $facebook-blue;

    &:not(:disabled):not(.disabled) {
      &:active,
      &.active {
        color: $facebook-blue;
        background-color: $white;
        border-color: $facebook-blue;
      }
    }
  }

  &.bsky {
    $bsky-blue: #0085ff;
    border: solid 1px $bsky-blue;
    color: $bsky-blue;

    &:not(:disabled):not(.disabled) {
      &:active,
      &.active {
        color: $bsky-blue;
        background-color: $white;
        border-color: $bsky-blue;
      }
    }
  }

  &.pinterest {
    $pinterest-red: #e60023;

    border: solid 1px $pinterest-red;
    color: $pinterest-red;

    &:not(:disabled):not(.disabled) {
      &:active,
      &.active {
        color: $pinterest-red;
        background-color: $white;
        border-color: $pinterest-red;
      }
    }
  }

  &.weavex {
    $weavex-green: #3e861c;

    border: solid 1px $weavex-green;
    color: $weavex-green;

    &:not(:disabled):not(.disabled) {
      &:active,
      &.active {
        color: $weavex-green;
        background-color: $white;
        border-color: $weavex-green;
      }
    }

    .icon-weavex {
      font-size: $font-size-small;

      @media (min-width: $bp-4k) {
        font-size: $font-size-small-4k;
      }

      &::before {
        content: "W";
        font-family: $font-family-sans-serif;
        font-weight: 800;
        font-style: italic;
      }
    }
  }

  [class^="icon"] {
    font-size: $font-size-base;

    @media (min-width: $bp-4k) {
      font-size: $font-size-base-4k;
    }
  }

  span.text {
    font-family: $font-family-sans-serif;
    font-weight: 600;
    padding-left: 0.75rem;
  }
}
</style>
