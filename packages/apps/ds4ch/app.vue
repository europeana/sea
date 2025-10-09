<script setup>
import useCanonicalUrl from "@europeana/sea-base-layer/composables/canonicalUrl";
import favIconImage from "@europeana/style/img/DS4CH/favicon.ico";
const { urlWithOnlyQuery, urlWithBothLocaleAndQuery } = useCanonicalUrl();

useHead({
  link: [
    {
      hreflang: "x-default",
      rel: "alternate",
      href: urlWithOnlyQuery,
    },
    {
      rel: "icon",
      href: favIconImage,
      type: "image/x-icon",
    },
  ],
  meta: [
    {
      hid: "og:url",
      property: "og:url",
      content: urlWithBothLocaleAndQuery,
    },
  ],
});
</script>

<template>
  <div class="landing-page xxl-page">
    <NuxtRouteAnnouncer />
    <PageHeader />
    <main>
      <NuxtPage />
    </main>
    <PageFooter />
    <!-- Uncomment to test consent manager
    <ClientOnly>
      <div class="my-5">
      Consent required: {{ $consentManager.consentRequired }} Matomo accepted:
      {{ $consentManager.isServiceAccepted("matomo") }}
      <button @click="$consentManager.acceptAll()">Accept all</button>
      <button @click="$consentManager.rejectAll()">Reject all</button>
      <button @click="$consentManager.savePreferences(['matomo'])">
        Accept only matomo
      </button>
      </div>
    </ClientOnly> -->
  </div>
</template>
