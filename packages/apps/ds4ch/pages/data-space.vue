<script setup>
import contentHubPageQuery from "@/graphql/queries/contentHubPage.graphql";
import { provide } from "vue";

const slug = "data-space";
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

provide("featuredContentTags", [
  "3d",
  "artificial-intelligence",
  "copyright",
  "extended-reality",
  "academic-research",
  "education",
  "tourism",
  "funding",
  "impact",
  "multilinguality",
  "digital-storytelling",
  "diversity-and-inclusion",
  "reuse",
]);

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
      class="mt-5 mb-5"
      site="dataspace-culturalheritage.eu"
      :content-types="page.contentTypes"
      :default-card-thumbnail="defaultCardThumbnail"
      :cta-banners="page.hasPartCollection?.items"
      :featured-entry="page.featuredContent"
    />
  </div>
</template>

<style lang="scss">
@import "assets/scss/variables";
@import "assets/scss/pagination";
</style>
