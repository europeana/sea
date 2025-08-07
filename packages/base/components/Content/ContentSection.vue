<script setup>
import contentfulEntryHasContentType from "@/utils/contentful/entryHasContentType.js";

defineProps({
  richTextIsCard: {
    type: Boolean,
    default: true,
  },
  section: {
    type: Object,
    required: true,
  },
});

const attributionFields = (fields) => {
  return {
    name: fields?.name,
    creator: fields?.creator,
    provider: fields?.provider,
    rightsStatement: fields?.license,
    url: fields?.url,
  };
};
</script>

<template>
  <ContentRichText
    v-if="contentfulEntryHasContentType(section, 'ContentTypeRichText')"
    :text="section.text"
    :rich-text-is-card="richTextIsCard"
  />
  <!-- TODO: add EmbedGateway -->
  <!-- <EmbedGateway
    v-else-if="contentfulEntryHasContentType(section, 'Embed')"
    class="media-viewer-content mb-5"
    :embed-code="section.embed"
  > -->
  <EmbedHTML
    v-else-if="contentfulEntryHasContentType(section, 'Embed')"
    :html="section.embed"
    :title="section.title"
    class="mb-5"
  />
  <!-- </EmbedGateway> -->
  <ImageWithAttributionContainer
    v-else-if="contentfulEntryHasContentType(section, 'ImageWithAttribution')"
    :src="section.image ? section.image.url : null"
    :content-type="section.image ? section.image.contentType : null"
    :width="section.image ? section.image.width : null"
    :height="section.image ? section.image.height : null"
    :alt="
      section.image && section.image.description
        ? section.image.description
        : ''
    "
    :attribution="attributionFields(section)"
    :rights-statement="section.license"
  />
  <GenericCallToAction
    v-else-if="contentfulEntryHasContentType(section, 'Link')"
    :text="section.text"
    :url="section.url"
  />
</template>

<style lang="scss" scoped>
:deep(.attribution) {
  &::after {
    padding-top: 0.2rem;
  }
}
</style>
