<script setup>
import { kebabCase } from "lodash-es";
import { entryHasContentType } from "@europeana/sea-base-layer/utils/contentful/index.js";

defineProps({
  sections: {
    type: Array,
    default: () => [],
  },
});

const sectionId = (section) => {
  return kebabCase(section.nameEN);
};
const getClasses = (section) => {
  const classes = [];
  if (section.profile?.background) {
    classes.push(`bg-color-${section.profile.background}`);
  }
  if (entryHasContentType(section, "ImageCard")) {
    classes.push("image-card-container-wrapper");
  }
  return classes;
};
</script>

<template>
  <div
    v-for="(section, index) in sections"
    :id="sectionId(section)"
    :key="index"
    class="scroll-margin-top"
    :class="getClasses(section)"
  >
    <div
      v-if="entryHasContentType(section, 'ImageCard')"
      class="container image-card-container"
    >
      <ImageTextCard :card="section" />
    </div>
    <LandingIllustrationGroupContainer
      v-else-if="entryHasContentType(section, 'IllustrationGroup')"
    >
      <LandingIllustrationGroup
        :title="section.name"
        :text="section.text"
        :illustrations="
          section.hasPartCollection && section.hasPartCollection.items
        "
      />
    </LandingIllustrationGroupContainer>
    <div
      v-else-if="entryHasContentType(section, 'TestimonialCardGroup')"
      class="container testimonial-card-container"
    >
      <CardGroup
        :title="section.name"
        :text="section.text"
        :cards="section.hasPartCollection?.items"
        card-group-classes="row-cols-1 row-cols-xl-4"
      />
    </div>
    <GenericCallToActionBanner
      v-else-if="entryHasContentType(section, 'PrimaryCallToAction')"
      :title="section.name"
      :text="section.text"
      :link="section.relatedLink"
      :background-image="section.image"
    />
    <LandingSubSection
      v-else-if="entryHasContentType(section, 'LandingSubSection')"
      :title="section.name"
      :text="section.text"
      :sections="section.hasPartCollection && section.hasPartCollection.items"
      image-card-cta-classes="btn-primary icon-chevron"
    />
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

.testimonial-card-container {
  padding-bottom: 3rem;

  @media (min-width: $bp-medium) {
    padding-bottom: 6rem;
  }

  @media (min-width: $bp-4k) {
    padding-bottom: 12rem;
  }
}
</style>
