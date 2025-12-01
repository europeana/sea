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
    <div
      id="toaster-bottom-left"
      class="toast-container position-fixed bottom-0 ms-2 ms-sm-4 mb-2 mb-sm-4"
    >
      <!-- Keep at the top of page for easy keyboard a11y -->
      <CookiesWidget />
    </div>
    <a class="skip-main" href="#main">
      {{ $t("skipToMainContent") }}
    </a>
    <PageHeader />
    <main id="main" role="main">
      <NuxtPage />
    </main>
    <PageFooter />
  </div>
</template>
