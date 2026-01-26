<script setup>
import categoriesGraphql from "@/graphql/queries/categories.graphql";
const contentful = inject("$contentful");
const { localeProperties } = useI18n();
const featuredTags = inject("featuredContentTags", null);

defineProps({
  /**
   * Array of tags which have already been selected.
   */
  selectedTags: {
    type: Array,
    default: () => [],
  },
  /**
   * The active taxonomy or type filter
   */
  selectedTaxonomyOrType: {
    type: String,
    default: null,
  },
  /**
   * array of the supported taxonomies and types
   */
  supportedTaxonomiesAndTypes: {
    type: Array[String],
    required: true,
  },
  /**
   * The site value by which to restrict the query
   * @values dataspace-culturalheritage.eu, www.europeana.eu
   */
  site: {
    type: String,
    required: true,
  },
});

// Do we still need to fetch all tags here?
const { data: tags, error } = await useAsyncData("allCategories", async () => {
  const categoriesVariables = {
    locale: localeProperties.value.language,
  };
  const categoriesResponse = await contentful.query(
    categoriesGraphql,
    categoriesVariables,
  );
  return (categoriesResponse.data.categoryCollection.items || []).sort((a, b) =>
    a.name.trim().toLowerCase().localeCompare(b.name.trim().toLowerCase()),
  );
});

if (error.value) {
  throw createError(error.value);
}
</script>
<template>
  <ContentFeaturedTags
    v-if="featuredTags"
    :tags="tags"
    :selected-tags="selectedTags"
  />
  <ContentTagsDropdown
    :tags="tags"
    :selected-tags="selectedTags"
    :selected-taxonomy-or-type="selectedTaxonomyOrType"
    :supported-taxonomies-and-types="supportedTaxonomiesAndTypes"
    :site="site"
  />
</template>
