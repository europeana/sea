<script setup>
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
  return props.tags?.filter((tag) =>
    (featuredTags || []).includes(tag.identifier),
  );
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
        :bubble-up="true"
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

      > ul {
        width: max-content;
        max-width: calc(var(--width) * 0.55px);
      }
    }
  }
}
</style>
