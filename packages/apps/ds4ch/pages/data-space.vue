<script setup>
import landingPageQuery from "@/graphql/queries/landingPage.graphql";
import blogPostListingPageQuery from "@/graphql/queries/blogPostListingPage.graphql";

const slug = "data-space";
const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const { data } = await useAsyncData(`landingPage:${slug}`, async () => {
  const variables = {
    identifier: slug,
    locale: localeProperties.value.language,
  };

  const responses = await Promise.all([
    contentful.query(landingPageQuery, variables),
    contentful.query(blogPostListingPageQuery, variables),
  ]);

  return {
    page: responses[0].data?.landingPageCollection?.items?.[0] || {},
    posts: responses[1].data?.blogPostingCollection?.items || [],
  };
});

const { page, posts } = data.value;

useHead({
  title: page.headline,
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
    <ol v-if="posts.length > 0">
      <li v-for="(post, index) in posts" :key="index">
        <NuxtLinkLocale
          :to="{ name: 'news-slug', params: { slug: post.identifier } }"
        >
          {{ post.name }}
        </NuxtLinkLocale>
      </li>
    </ol>
  </div>
</template>
