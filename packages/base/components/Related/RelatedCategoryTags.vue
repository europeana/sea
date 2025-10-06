<script setup>
const route = useRoute();
const { matomo } = useMatomo();

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
   * Text to use as a heading. If omitted no title will show.
   */
  heading: {
    type: String,
    default: null,
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
const clickBadge = (tagId) => {
  const action = isActive(tagId) ? "Deselect tag" : "Select tag";
  matomo.value?.trackEvent("Tags", action, tagId);
};
const handleLeft = (event) => {
  event.target.previousElementSibling?.focus();
};
const handleRight = (event) => {
  event.target.nextElementSibling?.focus();
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
        {{ heading }}
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
            @click="clickBadge(tag.identifier)"
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
@import "assets/scss/variables";

.icon-ic-tag {
  color: $darkgrey;
  display: inline-block;
  font-size: $font-size-large;
  line-height: calc(2rem - 1px);

  @at-root .xxl-page & {
    @media (min-width: $bp-4k) {
      line-height: calc(2 * calc(2rem - 1px));
      font-size: 3rem;
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
      margin: 0 0.5rem 0.75rem;
    }
  }
}

h2.related-heading {
  font-size: $font-size-14;
  font-weight: 600;
  margin-bottom: 0.75rem;

  @media (min-width: $bp-4k) {
    font-size: $font-size-28;
    margin-bottom: 1.5rem;
  }
}
</style>
