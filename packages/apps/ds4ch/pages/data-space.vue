<script setup>
import stripMarkdown from "@europeana/sea-base-layer/utils/markdown/strip.js";
import { provide } from "vue";
import { useAsyncPageData } from "@europeana/sea-base-layer/composables/useAsyncPageData";
import contentHubPageQuery from "@/graphql/queries/contentHubPage.graphql";
import { usePageMeta } from "@europeana/sea-base-layer/composables/pageMeta";
import errorImages from "@/utils/errorMessageImages.json";

const slug = "data-space";
const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const { page } = await useAsyncPageData(`contentHubPage:${slug}`, async () => {
  const variables = {
    identifier: slug,
    locale: localeProperties.value.language,
  };

  const response = await contentful.query(contentHubPageQuery, variables);

  return { page: response.data?.contentHubPageCollection?.items?.[0] };
});

usePageMeta({
  title: stripMarkdown(page.value.name),
  description: page.value.description,
  image: page.value.image,
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

const sortedContentTypes = ["blog post", "event", "training", "project"].filter(
  (ct) => page.value.contentTypes.includes(ct),
);
</script>

<template>
  <div>
    <LandingHero
      :headline="page.name"
      :text="page.headline"
      :hero-image="page.primaryImageOfPage"
      variant="alternate"
    />
    <ContentInterface
      class="mt-5"
      site="dataspace-culturalheritage.eu"
      :content-types="sortedContentTypes"
      :default-card-thumbnail="defaultCardThumbnail"
      :cta-banners="page.hasPartCollection?.items"
      :featured-entry="page.featuredContent"
    >
      <template #error-message>
        <ErrorMessage
          :error="{ message: 'No results' }"
          :error-image="errorImages.noResults"
          title-tag="h2"
        />
      </template>
    </ContentInterface>
  </div>
</template>

<style lang="scss">
@import "assets/scss/variables";
@import "assets/scss/pagination";
</style>
