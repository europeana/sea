<script setup>
import categoriesGraphql from "@/graphql/queries/categories.graphql";
const route = useRoute();
const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const props = defineProps({
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

const featuredTags = inject("featuredContentTags", null);
const showDropdown = ref(false);
const searchTag = ref("");
const tagsInput = useTemplateRef("tagsearchinput");

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

const allDisplayTags = computed(() => {
  let displayTags;
  const keyword = trimmedKeyword.value;

  if (props.filteredTags) {
    // use filteredTags as those are sorted by most used
    displayTags = props.filteredTags
      .filter((tag) => !props.selectedTags.includes(tag))
      .map((tag) => tags.value.filter((t) => t.identifier === tag)[0]);
  } else {
    displayTags = tags.value;
  }

  if (keyword) {
    displayTags = displayTags.filter((tag) => {
      const tagLabel = tag.name;
      const tagNameMatch = tagLabel.toLowerCase().indexOf(keyword) > -1;
      return tagNameMatch;
    });
  }
  return displayTags;
});

const unfeaturedDisplayTags = computed(() => {
  if (!featuredTags) {
    return allDisplayTags.value;
  }
  return (
    allDisplayTags.value?.filter(
      (tag) => !featuredTags.includes(tag.identifier),
    ) || []
  );
});

const displaySelectedTags = computed(() => {
  return tags.value.filter(
    (tag) =>
      !featuredTags?.includes(tag.identifier) &&
      props.selectedTags.includes(tag.identifier),
  );
});
const trimmedKeyword = computed(() => {
  return searchTag.value.trim().toLowerCase();
});

watch(
  () => route.query.tags,
  () => {
    showDropdown.value = false;
  },
);

const setClickOutsideConfigIsActive = (isActive) => {
  clickOutsideConfig.value.isActive = isActive;
};
const handleFocusin = () => {
  setClickOutsideConfigIsActive(true);
  showDropdown.value = true;
};

const handleClickOutside = () => {
  setClickOutsideConfigIsActive(false);
  showDropdown.value = false;
};

const handleEsc = () => {
  tagsInput.value.blur();
  handleClickOutside();
};

const clickOutsideConfig = ref({
  capture: true,
  events: ["click", "dblclick", "focusin", "touchstart"],
  handler: handleClickOutside,
  isActive: false,
});
</script>

<template>
  <ContentFeaturedTags :tags="tags" :selected-tags="selectedTags" />
  <div class="container">
    <ContentTagsList
      v-if="displaySelectedTags.length > 0"
      :tags="displaySelectedTags"
      :selected="selectedTags"
      class="mb-2"
      route-name="data-space"
      :tag-icon="false"
    />
    <div
      ref="tagsdropdown"
      v-click-outside="handleClickOutside"
      class="position-relative mb-4 mb-4k-5"
      data-qa="tags dropdown"
      @keydown.esc="handleEsc"
    >
      <form
        id="tags-search-form"
        class="form-inline search-form"
        :class="{ show: showDropdown }"
        @submit.stop.prevent="() => {}"
      >
        <input
          :id="'tag-search-input'"
          ref="tagsearchinput"
          v-model="searchTag"
          class="form-control"
          autocomplete="off"
          type="search"
          :placeholder="$t('content.topics.label')"
          data-qa="tags dropdown search input"
          role="searchbox"
          aria-autocomplete="list"
          :aria-owns="showDropdown ? 'tags-options' : null"
          :aria-controls="showDropdown ? 'tags-options' : null"
          :aria-label="$t('content.topics.label')"
          @focusin="handleFocusin"
        />
      </form>
      <div
        v-if="showDropdown"
        id="tags-options"
        class="tag-search-dropdown"
        data-qa="tags search dropdown"
      >
        <ContentTagsList
          v-if="unfeaturedDisplayTags.length > 0"
          :tags="unfeaturedDisplayTags"
          :selected="selectedTags"
          tabindex="-1"
          class="badge-container mb-2"
          route-name="data-space"
        />
        <p v-else>
          {{ $t("content.topics.noOptions") }}
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.tag-search-dropdown {
  width: 100%;
  background-color: $white;
  max-height: 15rem;
  overflow: auto;
  position: absolute;
  z-index: 20;
  box-shadow: $boxshadow;
  padding: 0.5rem 0 0 0.5rem;
  border: 1px solid $lightgrey;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;

  @media (min-width: $bp-4k) {
    font-size: 2rem;
    padding: 1rem 0 0 1rem;
    border-width: 2px;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
    max-height: calc(1.5 * 15rem);
  }
}

.badge-container {
  margin: 0;

  :deep(.col-12) {
    padding: 0;
  }
}

.search-form.show {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
