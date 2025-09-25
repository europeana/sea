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
  </div>
</template>
