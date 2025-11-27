<script setup>
import useScrollTo from "@/composables/scrollTo.js";

const route = useRoute();
const { matomo } = useMatomo();
const { scrollToSelector } = useScrollTo();

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
   * If falsy, the current route name is used
   */
  routeNameOverride: {
    type: String,
    default: null,
  },
  /**
   * Variant of the badges
   */
  badgeVariant: {
    type: String,
    default: "badge-outline-light",
  },
  /**
   * Tag icon to include or not
   */
  tagIcon: {
    type: Boolean,
    default: true,
  },
  /**
   * If true, selected tags will be shown first
   */
  bubbleUp: {
    type: Boolean,
    default: false,
  },
});

const tagsWrapperRef = useTemplateRef("tagswrapper");

const orderedTags = computed(() => {
  if (!props.bubbleUp) {
    return props.tags;
  }

  const selected = [];
  const unselected = [];

  for (const tag of props.tags) {
    if (props.selected.includes(tag.identifier)) {
      selected.push(tag);
    } else {
      unselected.push(tag);
    }
  }

  return [...selected, ...unselected];
});

const routeName = computed(() => props.routeNameOverride || route.name);

const badgeLink = (tagId) => {
  const newRoute = { name: routeName.value };

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

// Scroll to the start when tags are (de)selected in horizontal scroll container
watch(orderedTags, () => {
  if (tagsWrapperRef.value) {
    scrollToSelector("div", {
      container: tagsWrapperRef.value,
      behavior: "smooth",
    });
  }
});
</script>
<template>
  <div class="row flex-md-row related-tags">
    <div v-if="tags.length > 0" data-qa="related tags" class="col col-12">
      <h2 v-if="heading" class="related-heading text-uppercase">
        {{ heading }}
      </h2>
      <div
        ref="tagswrapper"
        class="tags-wrapper"
        :class="{ 'd-flex': tagIcon }"
      >
        <span v-if="tagIcon" class="icon-ic-tag" />
        <ul class="nav" :class="{ 'ms-n2': !tagIcon }">
          <li v-for="tag in orderedTags.filter(Boolean)" :key="tag.identifier">
            <NuxtLinkLocale
              class="badge text-capitalize ms-2 ms-4k-3 mb-2 mb-4k-3"
              :class="{
                [badgeVariant]: true,
                selected: isActive(tag.identifier),
              }"
              :active="isActive(tag.identifier)"
              :to="badgeLink(tag.identifier)"
              :data-qa="`${tag.name} tag`"
              @keydown.left="handleLeft"
              @keydown.right="handleRight"
              @click="clickBadge(tag.identifier)"
            >
              <span>{{ tag.name }}</span>
              <span v-if="isActive(tag.identifier)" class="icon icon-clear" />
            </NuxtLinkLocale>
          </li>
        </ul>
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
