<script setup>
import stripMarkdown from "@europeana/sea-base-layer/utils/markdown/strip.js";
import { annotateParity } from "@europeana/sea-base-layer/utils/annotateParity.js";
import { deepFindEntriesOfType } from "@europeana/sea-base-layer/utils/contentful/deepFindEntriesOfType.js";
import { useAsyncPageData } from "@europeana/sea-base-layer/composables/useAsyncPageData";
import { usePageMeta } from "@europeana/sea-base-layer/composables/pageMeta";

import landingPageQuery from "@/graphql/queries/landingPage.graphql";

const route = useRoute();
const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const { page } = await useAsyncPageData(
  `landingPage:${route.params.slug}`,
  async () => {
    const variables = {
      identifier: route.params.slug,
      locale: localeProperties.value.language,
    };

    const response = await contentful.query(landingPageQuery, variables);
    return { page: response.data?.landingPageCollection?.items?.[0] };
  },
);

const sections = page.value.hasPartCollection?.items.filter((item) => !!item);

annotateParity(deepFindEntriesOfType(sections, "ImageCard"));

usePageMeta({
  title: stripMarkdown(page.value?.headline),
  description: page.value.description,
  image: page.value.image,
});
</script>

<template>
  <div v-if="page">
    <LandingHero
      :headline="page.headline || route.fullPath"
      :text="page.text"
      :hero-image="page.primaryImageOfPage"
    />
    <PageSections :sections="sections" />
  </div>
</template>
