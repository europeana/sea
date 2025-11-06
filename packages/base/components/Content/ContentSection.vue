<script setup>
import { entryHasContentType } from "@/utils/contentful/index.js";

defineProps({
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
    v-if="entryHasContentType(section, 'ContentTypeRichText')"
    :text="section.text"
    class="mb-4 mb-md-5 pb-4k-5"
  />
  <EmbedGateway
    v-else-if="entryHasContentType(section, 'Embed')"
    class="media-viewer-content mb-5"
    :embed-code="section.embed"
  >
    <EmbedHTML
      :html="section.embed"
      :title="section.title"
      class="mb-4 mb-md-5 pb-4k-5"
    />
  </EmbedGateway>
  <ImageWithAttributionContainer
    v-else-if="entryHasContentType(section, 'ImageWithAttribution')"
    class="mb-4 mb-md-5 pb-4k-5"
  >
    <ImageWithAttribution
      :src="section.image?.url || null"
      :content-type="section.image?.contentType || null"
      :width="section.image?.width || null"
      :height="section.image?.height || null"
      :alt="section.image?.description || ''"
      :attribution="attributionFields(section)"
    />
  </ImageWithAttributionContainer>
  <GenericCallToAction
    v-else-if="entryHasContentType(section, 'Link')"
    :text="section.text"
    :url="section.url"
    class="mb-4 mb-md-5 pb-4k-5"
  />
</template>

<style lang="scss" scoped>
:deep(.attribution) {
  &::after {
    padding-top: 0.2rem;
  }
}
</style>
