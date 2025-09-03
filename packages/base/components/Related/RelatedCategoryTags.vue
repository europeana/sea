<script setup>
const route = useRoute();

const props = defineProps({
  /**
   * Array of tags
   */
  tags: {
    type: Array,
    required: true,
  },
  /**
   * Array of tags selected by the user
   */
  selected: {
    type: Array,
    default: () => [],
  },
  /**
   * Toggle to show or hide the heading
   */
  heading: {
    type: Boolean,
    default: true,
  },
  /**
   * Name of the route which the tags link to
   */
  routeName: {
    type: String,
    required: true,
  },
  /**
   * Variant of the badges
   */
  badgeVariant: {
    type: String,
    default: "badge-outline-light",
  },
});

const badgeLink = (tagId) => {
  const newRoute = { name: props.routeName };

  if (props.selected.includes(tagId)) {
    const tagsWithoutCurrent = props.selected.filter((item) => item !== tagId);
    const tagsQuery =
      tagsWithoutCurrent.length > 0 ? tagsWithoutCurrent.join(",") : undefined;
    const newQuery = { ...route.query };
    delete newQuery.page;
    if (tagsQuery) {
      newQuery.tags = tagsQuery;
    } else {
      delete newQuery.tags;
    }
    newRoute.query = newQuery;
  } else {
    const newQuery = { ...route.query };
    delete newQuery.page;
    newQuery.tags = props.selected.concat(tagId).join(",");
    newRoute.query = newQuery;
  }

  return newRoute;
};
const isActive = (tagId) => {
  return props.selected.includes(tagId);
};
// TODO: add matomo tracking on click for each NuxtLinkLocale
// > @click="clickBadge(tag.identifier)"
// const clickBadge = (tagId =>) {
//   if ($matomo) {
//     const action = isActive(tagId) ? "Deselect tag" : "Select tag";
//     $matomo.trackEvent("Tags", action, tagId);
//   }
// }
const handleLeft = (event) => {
  event.target.previousSibling?.focus();
};
const handleRight = (event) => {
  event.target.nextSibling?.focus();
};
</script>
<template>
  <div class="row flex-md-row related-category-tags">
    <div
      v-if="tags.length > 0"
      data-qa="related category tags"
      class="col col-12"
    >
      <h2 v-if="heading" class="related-heading text-uppercase">
        {{ $t("related.categoryTags.title") }}
      </h2>
      <div class="d-flex">
        <span class="icon-ic-tag" />
        <div>
          <NuxtLinkLocale
            v-for="(tag, index) in tags.filter((tag) => !!tag)"
            :key="index"
            class="badge ms-2 ms-4k-3 mb-2 mb-4k-3"
            :class="badgeVariant"
            :active="isActive(tag.identifier)"
            :to="badgeLink(tag.identifier)"
            :data-qa="`${tag.name} category tag`"
            @keydown.left="handleLeft"
            @keydown.right="handleRight"
          >
            <span>{{ tag.name }}</span>
            <span
              v-if="isActive(tag.identifier)"
              class="icon icon-clear clear-indicator"
            />
          </NuxtLinkLocale>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.icon-ic-tag {
  color: $darkgrey;
  display: inline-block;
  font-size: 1.5rem;
  line-height: calc(2rem - 1px);

  @at-root .xxl-page & {
    @media (min-width: $bp-4k) {
      line-height: calc(1.5 * calc(2rem - 1px));
      font-size: calc(1.5 * 1.5rem);
    }
  }
}

.badge-outline-light {
  margin: 0 0.25rem 0.5rem;

  @media (min-width: $bp-medium) {
    overflow: visible;
    max-width: none;

    span {
      overflow: visible;
    }
  }

  @at-root .xxl-page & {
    @media (min-width: $bp-4k) {
      margin: 0 calc(1.5 * 0.25rem) 0.75rem;
    }
  }
}
</style>
