<script setup>
import landingPageQuery from "@/graphql/queries/landingPage.graphql";

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
</script>

<template>
  <div class="home-page">
    <h1>{{ page.headline }}</h1>
    <PageSections :sections="sections" />
  </div>
</template>
