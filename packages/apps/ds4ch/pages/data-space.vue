<script setup>
import landingPageQuery from "@/graphql/queries/landingPage.graphql";
import blogPostListingPageQuery from "@/graphql/queries/blogPostListingPage.graphql";
import useScrollTo from "@europeana/sea-base-layer/composables/scrollTo";

const { scrollToSelector } = useScrollTo();
const { t } = useI18n({ useScope: "global" });
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

watch(page, () => {
  scrollToSelector("#results", { offsetTop: -100 });
});

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
  <div class="mb-5">
    <LandingHero
      :headline="data.page.headline || ''"
      :text="data.page.text"
      :hero-image="data.page.primaryImageOfPage"
      variant="alternate"
    />
    <div id="results" class="container mt-5 mb-5">
      <output class="context-label mb-4 mb-4k-5">
        {{ t("results", { count: data.totalItems }) }}
      </output>
      <CardGroup v-if="cards.length > 0" :cards="cards" />
    </div>
    <PaginationNavInput :total-items="data.totalItems" />
  </div>
</template>

<style lang="scss">
@import "assets/scss/variables";
@import "assets/scss/pagination";

.xxl-page output.context-label {
  font-size: $font-size-14;

  @media (min-width: $bp-4k) {
    font-size: $font-size-28;
  }
}
</style>
