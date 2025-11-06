<script setup>
import { annotateParity } from "@europeana/sea-base-layer/utils/annotateParity.js";
import { deepFindEntriesOfType } from "@europeana/sea-base-layer/utils/contentful/deepFindEntriesOfType.js";

import landingPageQuery from "@/graphql/queries/landingPage.graphql";

const route = useRoute();
const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const { data: page } = await useAsyncData(
  `landingPage:${route.params.slug}`,
  async () => {
    const variables = {
      identifier: route.params.slug,
      locale: localeProperties.value.language,
    };

    const response = await contentful.query(landingPageQuery, variables);
    return response.data?.landingPageCollection?.items?.[0];
  },
);

if (!page.value) {
  showError({ statusCode: 404, statusMessage: "Not Found" });
}

const sections = page.value.hasPartCollection?.items.filter((item) => !!item);

annotateParity(deepFindEntriesOfType(sections, "ImageCard"));

useHead({
  title: page.value.headline,
});
</script>

<template>
  <div>
    <LandingHero
      :headline="page.headline || route.fullPath"
      :text="page.text"
      :hero-image="page.primaryImageOfPage"
    />
    <PageSections :sections="sections" />
  </div>
</template>
