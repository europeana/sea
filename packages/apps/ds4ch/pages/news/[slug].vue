<script setup>
import blogPostPageQuery from "@/graphql/queries/blogPostPage.graphql";

const route = useRoute();

const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const { data: page } = await useAsyncData(
  `blogPostPage:${route.params.slug}`,
  async () => {
    const variables = {
      identifier: route.params.slug,
      locale: localeProperties.value.language,
    };

    const response = await contentful.query(blogPostPageQuery, variables);
    return response.data?.blogPostingCollection?.items?.[0] || {};
  },
);

const sections = page.value.hasPartCollection?.items.filter((item) => !!item);
</script>
<template>
  <div>
    <h1>{{ page.name || route.fullPath }}</h1>
    {{ sections }}
  </div>
</template>
