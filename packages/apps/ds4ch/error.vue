<script setup>
import favIconImage from "@europeana/style/img/DS4CH/favicon.ico";

const props = defineProps({
  error: {
    type: Object,
    default: null,
  },
});

useHead({
  link: [
    {
      rel: "icon",
      href: favIconImage,
      type: "image/x-icon",
    },
  ],
  title: props.error.message,
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
    <PageHeader />
    <main>
      <div class="page text-page">
        <div class="container footer-margin pb-5">
          <div class="row justify-content-center">
            <div class="col col-12 col-lg-8">
              <GenericAlertMessage :error="props.error" />
            </div>
          </div>
        </div>
      </div>
    </main>
    <PageFooter />
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "assets/scss/variables";

.text-page {
  margin-top: $page-header-height; // leave space for the fixed positioned header

  @media (min-width: $bp-4k) {
    margin-top: $page-header-height-4k;
  }
}
</style>
