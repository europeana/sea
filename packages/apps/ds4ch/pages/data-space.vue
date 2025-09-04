<script setup>
import landingPageQuery from "@/graphql/queries/landingPage.graphql";

const slug = "data-space";
const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const { data: page } = await useAsyncData(`landingPage:${slug}`, async () => {
  const variables = {
    identifier: slug,
    locale: localeProperties.value.language,
  };

  const response = await contentful.query(landingPageQuery, variables);

  return response.data?.landingPageCollection?.items?.[0] || {};
});

useHead({
  title: page.value.headline,
});

const defaultCardThumbnail = {
  image: { url: useRuntimeConfig().public.defaultThumbnail },
};
</script>

<template>
  <div class="mb-5">
    <LandingHero
      :headline="page.headline || ''"
      :text="page.text"
      :hero-image="page.primaryImageOfPage"
      variant="alternate"
    />
    <ContentInterface
      class="container mt-5 mb-5"
      site="dataspace-culturalheritage.eu"
      :content-types="['blogPostings']"
      :default-card-thumbnail="defaultCardThumbnail"
    />
  </div>
</template>

<style lang="scss">
@import "assets/scss/variables";
@import "assets/scss/pagination";

.xxl-page output.context-label {
  font-size: $font-size-14;

  @media (min-width: $bp-4k) {
    font-size: $font-size-28;
  }
}
</style>
