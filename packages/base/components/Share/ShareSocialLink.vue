<script setup>
import useCanonicalUrl from "@europeana/sea-base-layer/composables/canonicalUrl";

const { urlWithOnlyQuery } = useCanonicalUrl();
const { matomo } = useMatomo();

const props = defineProps({
  network: {
    type: String,
    required: true,
  },
});

const allNetworks = {
  bluesky: {
    identifier: "bsky",
    name: "Bluesky",
    url: `https://bsky.app/intent/compose?text=${urlWithOnlyQuery?.value}`,
  },
  facebook: {
    identifier: "facebook",
    name: "Facebook",
    url: `https://www.facebook.com/sharer/sharer.php?display=page&u=${urlWithOnlyQuery?.value}`,
  },
  linkedin: {
    identifier: "linkedin",
    name: "LinkedIn",
    url: `https://www.linkedin.com/shareArticle?url=${urlWithOnlyQuery?.value}`,
  },
};

const network = allNetworks[props.network];

const trackClickLink = () => {
  matomo.value?.trackEvent(
    "Social media",
    "Click social network",
    network.name,
  );
};
</script>

<template>
  <NuxtLink
    :class="`btn btn-secondary social-share ${network.identifier} d-inline-flex align-items-center`"
    :to="network.url"
    target="_blank"
    :aria-label="$t('actions.shareOn', { social: network.name })"
    @click="trackClickLink(network.name)"
  >
    <span :class="`icon-${network.identifier}`" />
    <span class="ms-2">{{ network.name }} </span>
  </NuxtLink>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.landing-page.xxl-page,
* {
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
  }
}
</style>
