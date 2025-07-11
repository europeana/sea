<script setup>
import { inject } from "vue";
import landingPageQuery from "@/graphql/queries/landingPage.graphql";

const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const variables = {
  identifier: "/",
  locale: localeProperties.value.language,
};

const response = await contentful.query(landingPageQuery, variables);
const { name: title } = response.data?.landingPageCollection?.items?.[0] || {};
</script>

<template>
  <div class="bg-light" style="height: 200px">
    <h1>{{ title }}</h1>
  </div>
</template>
