<script setup>
import categoriesGraphql from "@/graphql/queries/categories.graphql";
const contentful = inject("$contentful");
const { localeProperties } = useI18n();
const featuredTags = inject("featuredContentTags", null);

defineProps({
  /**
   * Filtered tags, by relevance and sorted on most used
   */
  filteredTags: {
    type: Array,
    default: null,
  },
  /**
   * Array of tags which have already been selected.
   */
  selectedTags: {
    type: Array,
    default: () => [],
  },
});

const { data: tags } = await useAsyncData("allCategories", async () => {
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
</script>
<template>
  <ContentFeaturedTags
    v-if="featuredTags"
    :tags="tags"
    :selected-tags="selectedTags"
  />
  <ContentTagsDropdown
    :tags="tags"
    :filtered-tags="filteredTags"
    :selected-tags="selectedTags"
  />
</template>
