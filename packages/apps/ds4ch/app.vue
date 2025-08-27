<script setup>
import useCanonicalUrl from "@europeana/sea-base-layer/composables/canonicalUrl";
const { urlWithOnlyQuery, urlWithBothLocaleAndQuery } = useCanonicalUrl();

useHead({
  link: [
    {
      hreflang: "x-default",
      rel: "alternate",
      href: urlWithOnlyQuery,
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
  </div>
</template>
