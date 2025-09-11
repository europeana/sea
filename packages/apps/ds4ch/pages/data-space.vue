<script setup>
import contentHubPageQuery from "@/graphql/queries/contentHubPage.graphql";

const slug = "data-space-hub";
const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const { data: page } = await useAsyncData(
  `contentHubPage:${slug}`,
  async () => {
    const variables = {
      identifier: slug,
      locale: localeProperties.value.language,
    };

    const response = await contentful.query(contentHubPageQuery, variables);

    return response.data?.contentHubPageCollection?.items?.[0] || {};
  },
);

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
      :headline="page.name"
      :text="page.headline"
      :hero-image="page.primaryImageOfPage"
      variant="alternate"
    />
    <ContentInterface
      class="container mt-5 mb-5"
      site="dataspace-culturalheritage.eu"
      :content-types="page.contentTypes"
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
