<script setup>
import { entryHasContentType } from "@europeana/sea-base-layer/utils/contentful/index.js";
import { useAsyncPageData } from "@europeana/sea-base-layer/composables/useAsyncPageData";
import landingPageQuery from "@/graphql/queries/landingPage.graphql";

const slug = "collections";
const contentful = inject("$contentful");
const { t, localeProperties } = useI18n({ useScope: "global" });

const { page } = await useAsyncPageData(`landingPage:${slug}`, async () => {
  const variables = {
    identifier: slug,
    locale: localeProperties.value.language,
  };

  const response = await contentful.query(landingPageQuery, variables);
  return { page: response.data?.landingPageCollection?.items?.[0] };
});

const sections = page.value.hasPartCollection?.items.filter((item) => !!item);
const featuredContent = page.value.featuredContent;

useHead({
  title: page.value.headline,
});
</script>

<template>
  <div>
    <LandingHero
      :headline="page.headline"
      :text="page.text"
      :hero-image="page.primaryImageOfPage"
    />
    <div v-if="featuredContent" class="container my-5 py-4k-5">
      <ContentFeaturedCard
        :sub-title="t('featured')"
        :title="featuredContent.name"
        :text="featuredContent.description"
        :image="featuredContent.image"
        :url="featuredContent.url"
      />
    </div>
    <template v-for="(section, index) in sections">
      <div
        v-if="entryHasContentType(section, 'IllustrationGroup')"
        :key="index"
        class="illustration-group container my-5 py-4k-5"
      >
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 g-4k-5">
          <div
            v-for="(card, cardIndex) in section.hasPartCollection?.items"
            :key="card.url || cardIndex"
            class="col"
          >
            <transition appear name="fade">
              <ContentCard
                :title="card.name"
                :sub-title="$t('portal')"
                :url="card.url"
                :image-url="card.image?.url"
                :image-content-type="card.image?.contentType"
                :image-width="card.image?.width"
                :image-height="card.image?.height"
                :contentful-image-crop-presets="{ small: { w: 520, h: 338 } }"
              />
            </transition>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

:deep(.content-card:not(.featured-content-card) .card-img) {
  justify-content: center;
  height: 13rem;

  @media (min-width: $bp-4k) {
    height: 26rem;
  }

  img {
    object-fit: contain;
    max-width: min(13rem, calc(100% - 4rem));
    margin: auto;

    @media (min-width: $bp-4k) {
      max-width: min(26rem, calc(100% - 8rem));
    }
  }
}
</style>
