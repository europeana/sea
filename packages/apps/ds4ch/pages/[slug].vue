<script setup>
import { annotateParity } from "@europeana/sea-base-layer/utils/annotateParity.js";
import { deepFindEntriesOfType } from "@europeana/sea-base-layer/utils/contentful/deepFindEntriesOfType.js";

import landingPageQuery from "@/graphql/queries/landingPage.graphql";

const route = useRoute();
const contentful = inject("$contentful");
const { localeProperties, t } = useI18n();

const { data } = await useAsyncData(
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

const page = data.value.page;

if (!page) {
  throw createError({
    fatal: true,
    statusCode: 404,
    statusMessage: t("errors.http.404"),
  });
}

const sections = page.hasPartCollection?.items.filter((item) => !!item);

annotateParity(deepFindEntriesOfType(sections, "ImageCard"));

useHead({
  title: page.headline,
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
