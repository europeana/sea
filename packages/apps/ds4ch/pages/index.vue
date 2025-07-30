<script setup>
import landingPageQuery from "@/graphql/queries/landingPage.graphql";
import { kebabCase } from "lodash-es";
import contentfulEntryHasContentType from "@europeana/sea-base-layer/utils/contentful/entryHasContentType.js";

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

const sections = page.value.hasPartCollection?.items.filter((item) => !!item);
const sectionId = (section) => {
  return kebabCase(section.nameEN);
};
const getClasses = (section) => {
  const classes = [];
  if (section.profile?.background) {
    classes.push(`bg-color-${section.profile.background}`);
  }
  if (contentfulEntryHasContentType(section, "ImageCard")) {
    classes.push("image-card-container-wrapper");
  }
  return classes;
};
</script>

<template>
  <div>
    <h1>{{ page.name }}</h1>
    <!-- TODO: create reusable sections component so this could be reused on other pages. Perhaps in base layer. -->
    <div
      v-for="(section, index) in sections"
      :id="sectionId(section)"
      :key="index"
      class="scroll-margin-top"
      :class="getClasses(section)"
    >
      <div
        v-if="contentfulEntryHasContentType(section, 'ImageCard')"
        class="container image-card-container"
      >
        <ImageTextCard :card="section" />
      </div>
      <div
        v-else-if="
          contentfulEntryHasContentType(section, 'TestimonialCardGroup')
        "
        class="container"
      >
        <CardGroup
          :title="section.name"
          :text="section.text"
          :cards="section.hasPartCollection.items"
        />
      </div>
      <LandingSubSection
        v-else-if="contentfulEntryHasContentType(section, 'LandingSubSection')"
        :title="section.name"
        :text="section.text"
        :sections="section.hasPartCollection && section.hasPartCollection.items"
        image-card-cta-classes="btn-primary icon-chevron"
      />
    </div>
  </div>
</template>
<style lang="scss">
@import "@europeana/style/scss/variables";

.image-card-container {
  @media (min-width: $bp-large) {
    max-width: none;
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
