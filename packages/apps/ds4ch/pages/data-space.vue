<script setup>
import landingPageQuery from "@/graphql/queries/landingPage.graphql";

const slug = "data-space";
const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const { data: page } = await useAsyncData(`landingPage:${slug}`, async () => {
  const variables = {
    identifier: slug,
    locale: localeProperties.value.language,
  };

  const response = await contentful.query(landingPageQuery, variables);
  return response.data?.landingPageCollection?.items?.[0] || {};
});
</script>
<template>
  <div>
    <LandingHero
      :headline="page.headline || ''"
      :text="page.text"
      :hero-image="page.primaryImageOfPage"
      variant="alternate"
    />
  </div>
</template>
