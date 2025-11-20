<script setup>
import useScrollTo from "@/composables/scrollTo.js";
const { scrollToSelector } = useScrollTo();

const props = defineProps({
  /**
   * All tags data
   */
  tags: {
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
const featuredTagsRef = useTemplateRef("featuredtags");
const scrollWidth = ref(featuredTagsRef.value?.$refs.tagswrapper?.scrollWidth);

const featuredDisplayTags = computed(() => {
  if (!featuredTags) {
    return [];
  }
  const featuredTagsObjects = props.tags?.filter((tag) =>
    featuredTags.includes(tag.identifier),
  );

  const selected = [];
  const unselected = [];

  for (const tag of featuredTagsObjects) {
    if (props.selectedTags.includes(tag.identifier)) {
      selected.push(tag);
    } else {
      unselected.push(tag);
    }
  }

  return [...selected, ...unselected];
});

const setScrollWidth = async () => {
  if (window.innerWidth <= 1200) {
    // reset scrollWidth to retrieve actual max-content width
    scrollWidth.value = undefined;
    await nextTick();

    scrollWidth.value = featuredTagsRef.value?.$refs.tagswrapper?.scrollWidth;
  }
};

onMounted(() => {
  // Max content scroll width is used as CSS var to calculate horizontal scroll container width (breakpoint extralarge).
  setScrollWidth();
  window.addEventListener("resize", setScrollWidth);
});

onUnmounted(() => {
  window.removeEventListener("resize", setScrollWidth);
});

// Scroll to the start when tags are (de)selected in horizontal scroll container
watch(featuredDisplayTags, () => {
  if (featuredTagsRef.value?.$refs.tagswrapper) {
    scrollToSelector("div", {
      container: featuredTagsRef.value.$refs.tagswrapper,
      behavior: "smooth",
    });
  }
});
</script>
<template>
  <div class="overflow-x-hidden">
    <div class="container">
      <RelatedCategoryTags
        v-if="featuredDisplayTags.length > 0"
        ref="featuredtags"
        :tags="featuredDisplayTags"
        :selected="selectedTags"
        :heading="$t('categories.featuredTopics')"
        class="featured-tags badge-container mb-4"
        route-name="data-space"
        :tag-icon="false"
        :style="scrollWidth && `--width: ${scrollWidth}`"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.featured-tags {
  &.row {
    margin: 0;
  }

  :deep(.col) {
    padding: 0;
  }

  :deep(.tags-wrapper) {
    @media (max-width: $bp-extralarge) {
      overflow-x: scroll;
      margin-left: calc(-1 * (50vw - 50%));
      margin-right: calc(-1 * (50vw - 50%));
      padding-left: calc(50vw - 50%);
      scrollbar-width: none;

      > div {
        width: max-content;
        max-width: calc(var(--width) * 0.55px);
      }
    }
  }
}
</style>
