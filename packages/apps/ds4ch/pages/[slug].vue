<script setup>
import landingPageQuery from "@/graphql/queries/landingPage.graphql";

const route = useRoute();

const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const { data: page } = await useAsyncData("landingPage", async () => {
  const variables = {
    identifier: route.params.slug,
    locale: localeProperties.value.language,
  };

  const response = await contentful.query(landingPageQuery, variables);
  return response.data?.landingPageCollection?.items?.[0] || {};
});

const sections = page.value.hasPartCollection?.items.filter((item) => !!item);
</script>
<template>
  <div>
    <h1>{{ page.headline || route.fullPath }}</h1>
    <PageSections :sections="sections" />
  </div>
</template>
