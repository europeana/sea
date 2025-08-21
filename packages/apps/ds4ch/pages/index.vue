<script setup>
import stripMarkdown from "@europeana/sea-base-layer/utils/markdown/strip.js";
import landingPageQuery from "@/graphql/queries/landingPage.graphql";

import { annotateParity } from "@europeana/sea-base-layer/utils/annotateParity.js";
import { deepFindEntriesOfType } from "@europeana/sea-base-layer/utils/contentful/deepFindEntriesOfType.js";

const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const { data: page } = await useAsyncData("homePage", async () => {
  const variables = {
    identifier: "/",
    locale: localeProperties.value.language,
  };

  const response = await contentful.query(landingPageQuery, variables);
  return response.data?.landingPageCollection?.items?.[0] || {};
});

const sections = page.value.hasPartCollection?.items.filter((item) => !!item);

annotateParity(deepFindEntriesOfType(sections, "ImageCard"));

useHead({
  title: stripMarkdown(page.value.headline),
});
</script>

<template>
  <div class="home-page">
    <HomeHero
      :cta="page.relatedLink"
      :headline="page.headline || page.name"
      :hero-image="page.primaryImageOfPage"
      :text="page.text"
    />
    <PageSections :sections="sections" />
  </div>
</template>
