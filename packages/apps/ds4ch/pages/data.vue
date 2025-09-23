<script setup>
import contentfulEntryHasContentType from "@europeana/sea-base-layer/utils/contentful/entryHasContentType.js";
import landingPageQuery from "@/graphql/queries/landingPage.graphql";

const slug = "data";
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

const sections = page.value.hasPartCollection?.items.filter((item) => !!item);

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
    <template v-for="(section, index) in sections">
      <div
        v-if="contentfulEntryHasContentType(section, 'IllustrationGroup')"
        :key="index"
        class="container my-5 py-4k-5"
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

:deep(.content-card .card-img) {
  justify-content: center;
  height: 13rem;

  @media (min-width: $bp-4k) {
    height: 26rem;
  }

  img {
    object-fit: contain;
    max-width: min(13rem, calc(100% - 4rem));

    @media (min-width: $bp-4k) {
      max-width: min(26rem, calc(100% - 8rem));
    }
  }
}
</style>
