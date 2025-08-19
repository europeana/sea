<script setup>
import landingPageQuery from "@/graphql/queries/landingPage.graphql";
import blogPostListingPageQuery from "@/graphql/queries/blogPostListingPage.graphql";

const slug = "data-space";
const contentful = inject("$contentful");
const { localeProperties } = useI18n();
const route = useRoute();

const page = computed(() => Number(route.query.page) || 1);
const limit = 24;

const { data } = await useAsyncData(
  `landingPage:${slug}`,
  async () => {
    const skip = (page.value - 1) * limit;

    const variables = {
      identifier: slug,
      locale: localeProperties.value.language,
    };

    const responses = await Promise.all([
      contentful.query(landingPageQuery, variables),
      contentful.query(blogPostListingPageQuery, {
        ...variables,
        limit,
        skip,
      }),
    ]);

    return {
      page: responses[0].data?.landingPageCollection?.items?.[0] || {},
      posts: responses[1].data?.blogPostingCollection?.items || [],
      totalItems: responses[1].data?.blogPostingCollection?.total || 0,
    };
  },
  {
    watch: [page],
  },
);

const cards = computed(() =>
  data.value.posts.map((post) => ({
    ...post,
    __typename: "ContentCard",
    url: { name: "news-slug", params: { slug: post.identifier } },
  })),
);

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
    <CardGroup v-if="cards.length > 0" title="posts" :cards="cards" />
    <PaginationNavInput :total-items="data.totalItems" />
  </div>
</template>

<style lang="scss">
@import "assets/scss/variables";
@import "assets/scss/pagination";
</style>
