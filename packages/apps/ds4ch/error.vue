<script setup>
import favIconImage from "@europeana/style/img/DS4CH/favicon.ico";

const props = defineProps({
  error: {
    type: Object,
    default: null,
  },
});

const { t } = useI18n();

useHead({
  link: [
    {
      rel: "icon",
      href: favIconImage,
      type: "image/x-icon",
    },
  ],
  title: t("error"),
});
</script>

<template>
  <NuxtLayout>
    <div class="page">
      <div class="container footer-margin pb-5">
        <div class="row justify-content-center">
          <div class="col col-12">
            <ErrorMessage :error="props.error" />
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "assets/scss/variables";

.page {
  margin-top: $page-header-height; // leave space for the fixed positioned header

  @media (min-width: $bp-4k) {
    margin-top: $page-header-height-4k;
  }
}
</style>
