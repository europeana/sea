<script setup>
import { kebabCase } from "lodash-es";
import contentfulEntryHasContentType from "@europeana/sea-base-layer/utils/contentful/entryHasContentType.js";

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
  if (contentfulEntryHasContentType(section, "ImageCard")) {
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
      v-if="contentfulEntryHasContentType(section, 'ImageCard')"
      class="container image-card-container"
    >
      <ImageTextCard :card="section" />
    </div>
    <div
      v-else-if="contentfulEntryHasContentType(section, 'TestimonialCardGroup')"
      class="container"
    >
      <CardGroup
        :title="section.name"
        :text="section.text"
        :cards="section.hasPartCollection?.items"
      />
    </div>
    <GenericCallToActionBanner
      v-else-if="contentfulEntryHasContentType(section, 'PrimaryCallToAction')"
      :title="section.name"
      :text="section.text"
      :link="section.relatedLink"
      :background-image="section.image"
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
</style>
