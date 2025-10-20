<script setup>
import useCanonicalUrl from "@europeana/sea-base-layer/composables/canonicalUrl";
// import useConsentManager from "@europeana/sea-base-layer/composables/consentManager";
// import services from "@/utils/services/services";
import favIconImage from "@europeana/style/img/DS4CH/favicon.ico";

const { urlWithOnlyQuery, urlWithBothLocaleAndQuery } = useCanonicalUrl();

// const essentialServicesNames =services.filter(s => s.required).map(s => s.name)
// const allServicesNames = services.map(s => s.name)
// const {
//   acceptAll,
//   rejectAll,
//   consentRequired,
//   isServiceAccepted,
//   acceptOnly,
// } = useConsentManager(essentialServicesNames, allServicesNames);

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
    <div class="my-5">
      Consent required: {{ consentRequired }} Matomo accepted:
      {{ isServiceAccepted("matomo") }}
      <button @click="acceptAll()">Accept all</button>
      <button @click="rejectAll()">Reject all</button>
      <button @click="acceptOnly(['matomo'])">Accept only matomo</button>
    </div> -->
  </div>
</template>
