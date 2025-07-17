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
</script>

<template>
  <div>
    <h1>{{ page.name }}</h1>
  </div>
</template>
