<script setup>
import { annotateParity } from "@europeana/sea-base-layer/utils/annotateParity.js";
import { deepFindEntriesOfType } from "@europeana/sea-base-layer/utils/contentful/deepFindEntriesOfType.js";
import { useAsyncPageData } from "@europeana/sea-base-layer/composables/useAsyncPageData";
import { usePageMeta } from "@europeana/sea-base-layer/composables/pageMeta";

import landingPageQuery from "@/graphql/queries/landingPage.graphql";

const contentful = inject("$contentful");
const { t, localeProperties } = useI18n();

const { page } = await useAsyncPageData("homePage", async () => {
  const variables = {
    identifier: "/",
    locale: localeProperties.value.language,
  };

  const response = await contentful.query(landingPageQuery, variables);

  return { page: response.data?.landingPageCollection?.items?.[0] };
});

const sections = page.value.hasPartCollection?.items.filter((item) => !!item);

annotateParity(deepFindEntriesOfType(sections, "ImageCard"));

usePageMeta({
  title: t("home.title"),
  description: page.value.description,
  image: page.value.image,
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
