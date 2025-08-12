<script setup>
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
    return response.data?.landingPageCollection?.items?.[0] || {};
  },
);

const heroVariant = ["data-space"].includes(route.params.slug)
  ? "alternate"
  : null;

const sections = page.value.hasPartCollection?.items.filter((item) => !!item);
</script>
<template>
  <div>
    <LandingHero
      :headline="page.headline || route.fullPath"
      :text="page.text"
      :hero-image="page.primaryImageOfPage"
      :variant="heroVariant"
    />
    <PageSections :sections="sections" />
  </div>
</template>
