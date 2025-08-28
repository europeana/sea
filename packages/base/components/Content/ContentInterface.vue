<script setup>
import { uniq } from "lodash-es";
import useScrollTo from "@/composables/scrollTo.js";
import contentBySysIdGraphql from "@/graphql/queries/contentBySysId.graphql";
import blogPostingsListingMinimalGraphql from "@/graphql/queries/blogPostingsListingMinimal.graphql";
// import exhibitionsListingMinimalGraphql from "@/graphql/queries/exhibitionsListingMinimal.graphql";
// import storiesListingMinimalGraphql from "@/graphql/queries/storiesListingMinimal.graphql";
import { contentfulEntryUrl } from "../../utils/contentful/entry-url.js";

const props = defineProps({
  callToAction: {
    type: Object,
    default: () => {},
  },
  featuredEntry: {
    type: Object,
    default: () => {},
  },
  /**
   * The site value by which to restrict the query
   * @values dataspace-culturalheritage.eu, www.europeana.eu
   */
  site: {
    type: String,
    required: true,
  },
  /**
   * Content types to include in the interface.
   * @values blogPostings, exhibitions, stories
   */
  contentTypes: {
    type: Array[String],
    required: true,
  },
});

const { scrollToSelector } = useScrollTo();
const { localeProperties } = useI18n();
const route = useRoute();
const contentful = inject("$contentful");
const CTA_BANNER = "cta-banner";

const ctaBanner = CTA_BANNER;
const perPage = 24;
const selectedTags = computed(() => {
  return route.query.tags?.split(",") || [];
});

const selectedType = computed(() => {
  return route.query?.type || false;
});

const filteredTags = computed(() => {
  const relevantTags = relevantContentMetadata.value
    .map((contentEntry) => contentEntry.cats)
    .flat();
  const tagsSortedByMostUsed = relevantTags
    .map((tag, i, array) => {
      return { tag, total: array.filter((t) => t === tag).length };
    })
    .sort((a, b) => b.total - a.total)
    .map((tag) => tag.tag);

  return uniq(tagsSortedByMostUsed);
});

const fetchableSysIds = computed(() => {
  // Paginate
  const sliceFrom = (page.value - 1) * perPage;
  const sliceTo = sliceFrom + perPage;
  const ret = relevantContentMetadata.value
    .slice(sliceFrom, sliceTo)
    .map((contentEntry) => contentEntry.sys.id);
  return ret;
});

const fetchableSysIdsString = computed(() => {
  return fetchableSysIds.value.join("-");
});

const relevantContentMetadata = computed(() => {
  let relevantContentMetadata = allContentMetadata.value || [];
  if (selectedType.value) {
    // Filter by selected type
    relevantContentMetadata = relevantContentMetadata.filter((contentEntry) => {
      // Is this specific enough?
      return contentEntry["__typename"].toLowerCase().includes(selectedType);
      // Otherwise restore and extend:
      // return (this.selectedType === 'exhibition' && story['__typename'] === 'ExhibitionPage') ||
      //   (this.selectedType === 'story' && story['__typename'] === 'Story');
    });
  }
  if (selectedTags.value.length > 0) {
    // Filter by selected categories
    relevantContentMetadata = relevantContentMetadata.filter((contentEntry) => {
      return selectedTags.value.every((tag) => contentEntry.cats.includes(tag));
    });
  }
  return relevantContentMetadata;
});

const total = computed(() => {
  return relevantContentMetadata.value?.length || 0;
});

const page = computed(() => {
  return Number(route.query.page || 1);
});

// TODO: uncomment when featuredEntryCard component exists
// const showFeaturedEntry = computed(() => {
//   let featuredEntryMatchesSelectedTags = true;
//   const featuredEntryTags = props.featuredEntry?.categoriesCollection?.items?.map((cat) => cat.identifier) || [];
//   if (selectedTags.value.length > 0) {
//     featuredEntryMatchesSelectedTags = selectedTags.value.every((tag) => featuredEntryTags.includes(tag));
//   }

//   return props.featuredEntry && selectedType.value !== 'exhibition' && featuredEntryMatchesSelectedTags && (page.value === 1);
// })

async function fetchContent() {
  const contentSysIds = fetchableSysIds.value;
  if (contentSysIds.length === 0) {
    return [];
  }
  // Fetch full data for display of page of content entries
  const contentVariables = {
    locale: localeProperties.value.language,
    preview: route.query.mode === "preview",
    limit: perPage,
    ids: contentSysIds,
    site: props.site,
  };

  const contentResponse = await contentful.query(
    contentBySysIdGraphql,
    contentVariables,
  );

  const fullContent = [
    contentResponse.data.storyCollection.items,
    contentResponse.data.exhibitionPageCollection.items,
    contentResponse.data.blogPostingCollection.items,
  ].flat();

  const retrievedContentEntries = contentSysIds
    .map((sysId) =>
      fullContent.find((contentEntry) => contentEntry.sys.id === sysId),
    )
    .filter(Boolean);
  // This adds a 'cta-banner' entry, to be used as a placeholder for one cta.
  // TODO: allow muliple of these, each with a unique index. 'cta-banner-0', 'cta-banner-1', 'cta-banner-2'
  if (page.value === 1 && selectedTags.value.length === 0) {
    retrievedContentEntries.splice(12, 0, ctaBanner);
  }
  return retrievedContentEntries;
}

async function fetchContentMetadata() {
  // Fetch minimal data for all entries to support ordering by datePublished
  // and filtering by categories.
  const contentIdsVariables = {
    excludeSysId: props.featuredEntry?.sys?.id || "",
    locale: localeProperties.value.language,
    preview: route.query.mode === "preview",
    site: props.site,
  };
  const contentIds = [];
  // Splits sthe request into seperate graphql queries as otherwise
  // the maximum allowed complexity for a query of 11000 is exeeded.
  if (props.contentTypes.includes("blogPostings")) {
    const blogPostingsResponse = await contentful.query(
      blogPostingsListingMinimalGraphql,
      contentIdsVariables,
    );
    const blogPostings =
      blogPostingsResponse.data.blogPostingCollection?.items || [];
    contentIds.push(...blogPostings);
  }
  // TODO: Re-implement retrieval for:
  // storiesResponse.data.storyCollection?.items,
  // exhibitionsResponse.data.exhibitionPageCollection?.items,

  // Simplify categories
  for (const contentEntry of contentIds) {
    contentEntry.cats = (contentEntry.cats?.items || [])
      .filter((cat) => !!cat)
      .map((cat) => cat.id);
  }

  // Order by date published
  const ordered = contentIds.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return ordered;
}

const { data: allContentMetadata } = useAsyncData(
  "allContentMetadata",
  fetchContentMetadata,
);
const { data: contentEntries } = useAsyncData(
  fetchableSysIdsString,
  fetchContent,
  {
    watch: [fetchableSysIdsString],
  },
);

watch(page, () => {
  scrollToSelector("#header");
});
</script>

<template>
  <div id="content-interface">
    <client-only>
      <ContentTagsDropdown
        :filtered-tags="filteredTags"
        :selected-tags="selectedTags"
      />
    </client-only>
    <div id="temp-tags-display">
      <span v-for="tag in filteredTags" :key="tag"> {{ tag }}, </span>
    </div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <span class="context-label">
        {{ $t("results", total, { count: total }) }}
      </span>
      <!-- StoriesTypeFilter />
      <output
        form="stories-tags-search-form"
        class="visually-hidden"
        data-qa="results status message"
      >
        {{ $t('storiesPage.storiesHaveLoaded', [total]) }}
      </output-->
    </div>
    <!--LoadingSpinner
      v-if="$fetchState.pending"
      class="container position-absolute flex-md-row py-4 text-center"
    /-->
    <transition appear name="fade">
      <div
        class="row g-4 justify-content-center row-cols-1 row-cols-md-2 row-cols-lg-4 row-cols-wqhd-6"
      >
        <!--featuredEntryCard
          v-if="showFeaturedEntry"
          :featured-entry="featuredEntry"
        /-->
        <template v-for="entry in contentEntries">
          <div
            v-if="entry === ctaBanner"
            :key="entry"
            class="cta-banner-wrapper"
          >
            <GenericCallToActionBanner
              v-if="callToAction"
              :name="callToAction.name"
              :name-english="callToAction.nameEN"
              :text="callToAction.text"
              :link="callToAction.relatedLink"
              :illustration="callToAction.image"
            />
          </div>
          <ContentCard
            v-else
            :key="entry.sysId"
            :title="entry.name"
            :url="contentfulEntryUrl(entry)"
            :image-url="
              entry.primaryImageOfPage && entry.primaryImageOfPage.image.url
            "
            :image-content-type="
              entry.primaryImageOfPage &&
              entry.primaryImageOfPage.image.contentType
            "
          />
        </template>
      </div>
    </transition>
    <PaginationNavInput
      v-if="total > perPage"
      :per-page="perPage"
      :total-items="total"
    />
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "@europeana/style/scss/transitions";

.context-label {
  font-size: $font-size-small;

  @media (min-width: $bp-4k) {
    font-size: $font-size-small-4k;
  }
}

.cta-banner-wrapper {
  flex-basis: 100%;

  @media (min-width: $bp-small) {
    padding-left: $grid-gutter;
    padding-right: $grid-gutter;
  }

  @media (min-width: $bp-xxl) {
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
