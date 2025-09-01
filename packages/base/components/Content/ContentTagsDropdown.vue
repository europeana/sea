<script setup>
import categoriesQuery from "@/graphql/queries/categories.graphql";
const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const props = defineProps({
  filteredTags: {
    type: Array,
    default: null,
  },
  selectedTags: {
    type: Array,
    default: () => [],
  },
});

const showDropdown = ref(false);
const searchTag = ref("");
const tagsInput = useTemplateRef("tagsearchinput");

const { data: tags } = await useAsyncData("allCategories", async () => {
  const categoriesVariables = {
    locale: localeProperties.value.language,
  };
  const categoriesResponse = await contentful.query(
    categoriesQuery,
    categoriesVariables,
  );
  return (categoriesResponse.data.categoryCollection.items || []).sort((a, b) =>
    a.name.trim().toLowerCase().localeCompare(b.name.trim().toLowerCase()),
  );
});

const displayTags = computed(() => {
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
const displaySelectedTags = computed(() => {
  return tags.value.filter((tag) =>
    props.selectedTags.includes(tag.identifier),
  );
});
const trimmedKeyword = computed(() => {
  return searchTag.value.trim().toLowerCase();
});

watch(
  () => "$route.query.tags",
  () => {
    showDropdown.value = false;
  },
);

const setClickOutsideConfigIsActive = (isActive) => {
  // need to do this instead of just setting isActive due to
  // https://github.com/ndelvalle/v-click-outside/issues/143
  clickOutsideConfig.value = {
    ...clickOutsideConfig.value,
    isActive,
  };
};
const handleFocusin = () => {
  setClickOutsideConfigIsActive(true);
  showDropdown.value = true;
};
const handleClickOutside = () => {
  console.log("handleClickOutside");
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
  <div>
    <RelatedCategoryTags
      v-if="displaySelectedTags.length > 0"
      :tags="displaySelectedTags"
      :selected="selectedTags"
      :heading="false"
      class="mb-2"
      route-name="data-space"
    />
    <div
      ref="tagsdropdown"
      v-click-outside="handleClickOutside"
      class="position-relative mb-4"
      data-qa="tags dropdown"
      @keydown.esc="handleEsc"
    >
      <form
        id="stories-tags-search-form"
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
          :placeholder="$t('categories.search')"
          data-qa="tags dropdown search input"
          role="searchbox"
          aria-autocomplete="list"
          :aria-owns="showDropdown ? 'tags-options' : null"
          :aria-controls="showDropdown ? 'tags-options' : null"
          :aria-label="$t('categories.label')"
          @focusin="handleFocusin"
        />
      </form>
      <div
        v-if="showDropdown"
        id="tags-options"
        class="tag-search-dropdown"
        data-qa="tags search dropdown"
      >
        <RelatedCategoryTags
          v-if="displayTags.length > 0"
          ref="relatedCategoryTags"
          :tags="displayTags"
          :selected="selectedTags"
          :heading="false"
          tabindex="-1"
          class="badge-container mb-2"
          route-name="data-space"
        />
        <p v-else-if="displayTags.length === 0">
          {{ $t("categories.noOptions") }}
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
  overflow: hidden;
  position: absolute;
  z-index: 20;
  box-shadow: $boxshadow;
  padding: 0.5rem 0 0 0.5rem;
  border: 1px solid $lightgrey;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;

  @media (min-width: $bp-4k) {
    font-size: 1.5rem;
  }
}

.badge-container {
  max-height: 15rem;
  overflow: auto;
  margin: 0;

  @media (min-width: $bp-4k) {
    max-height: calc(1.5 * 15rem);
  }

  :deep(.col-12) {
    padding: 0;
  }
}

.search-form.show {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
