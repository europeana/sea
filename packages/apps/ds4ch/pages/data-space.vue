<script setup>
import stripMarkdown from "@europeana/sea-base-layer/utils/markdown/strip.js";
import { provide } from "vue";
import { createHttp404Error } from "@europeana/sea-base-layer/composables/error";
import contentHubPageQuery from "@/graphql/queries/contentHubPage.graphql";

const slug = "data-space";
const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const { data } = await useAsyncData(`contentHubPage:${slug}`, async () => {
  const variables = {
    identifier: slug,
    locale: localeProperties.value.language,
  };

  const response = await contentful.query(contentHubPageQuery, variables);

  return { page: response.data?.contentHubPageCollection?.items?.[0] };
});

const page = data.value.page;

if (!page) {
  throw createHttp404Error();
}

useSeoMeta({
  title: stripMarkdown(page.name),
  description: stripMarkdown(page.headline),
  ogDescription: stripMarkdown(page.headline),
  ogImage: page.image?.url, // use helper util for image sizing?
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

.xxl-page .context-label {
  font-size: $font-size-14;

  @media (min-width: $bp-4k) {
    font-size: $font-size-28;
  }
}
</style>
