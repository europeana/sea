<script setup>
import landingPageQuery from "@/graphql/queries/landingPage.graphql";
import blogPostListingPageQuery from "@/graphql/queries/blogPostListingPage.graphql";

const slug = "data-space";
const contentful = inject("$contentful");
const { localeProperties } = useI18n();
const route = useRoute();

const page = computed(() => Number(route.query.page) || 1);
const limit = 24;
const skip = computed(() => (page.value - 1) * limit);

const { data } = await useAsyncData(`landingPage:${slug}`, async () => {
  const variables = {
    identifier: slug,
    locale: localeProperties.value.language,
  };

  const responses = await Promise.all([
    contentful.query(landingPageQuery, variables),
    contentful.query(blogPostListingPageQuery, {
      ...variables,
      limit,
      skip: skip.value,
    }),
  ]);

  return {
    page: responses[0].data?.landingPageCollection?.items?.[0] || {},
    posts: responses[1].data?.blogPostingCollection?.items || [],
  };
});

useHead({
  title: data.value.page.headline,
});
</script>

<template>
  <div>
    <LandingHero
      :headline="data.page.headline || ''"
      :text="data.page.text"
      :hero-image="data.page.primaryImageOfPage"
      variant="alternate"
    />
    <ol v-if="data.posts.length > 0">
      <li v-for="(post, index) in data.posts" :key="index">
        <NuxtLinkLocale
          :to="{ name: 'news-slug', params: { slug: post.identifier } }"
        >
          {{ post.name }} - {{ post.description }}
        </NuxtLinkLocale>
      </li>
    </ol>
  </div>
</template>
