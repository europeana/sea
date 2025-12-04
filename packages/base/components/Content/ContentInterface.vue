<script setup>
import { uniq } from "lodash-es";
import useScrollTo from "@/composables/scrollTo.js";
import { createHttpError } from "@/composables/error.js";
import contentBySysIdGraphql from "@/graphql/queries/contentBySysId.graphql";
import blogPostingsListingMinimalGraphql from "@/graphql/queries/blogPostingsListingMinimal.graphql";
import projectPagesListingMinimalGraphql from "@/graphql/queries/projectPagesListingMinimal.graphql";
import trainingsListingMinimalGraphql from "@/graphql/queries/trainingsListingMinimal.graphql";
import eventsListingMinimalGraphql from "@/graphql/queries/eventsListingMinimal.graphql";
// import exhibitionsListingMinimalGraphql from "@/graphql/queries/exhibitionsListingMinimal.graphql";
// import storiesListingMinimalGraphql from "@/graphql/queries/storiesListingMinimal.graphql";

import {
  entryHasContentType,
  entryHasTaxonomyTerm,
  entryUrl,
} from "@/utils/contentful/index.js";
const { d, t } = useI18n({ useScope: "global" });

const props = defineProps({
  ctaBanners: {
    type: Array,
    default: () => [],
  },
  featuredEntry: {
    type: Object,
    default: () => {},
  },
  /**
   * Contentful Image to use for cards which don't have any image.
   * @param {Object} defaultCardThumbnail.image - image object
   * @param {string} defaultCardThumbnail.image.url - Image URL
   */
  defaultCardThumbnail: {
    type: Object,
    default: null,
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
   * @values "blog post", "exhibition", "project", "story", "training", "event"
   */
  contentTypes: {
    type: Array[String],
    required: true,
  },
});

const supportedContentTypes = computed(() => {
  return props.contentTypes.filter((ct) =>
    ["blog post", "project", "training", "event"].includes(ct),
  );
});

const { scrollToSelector } = useScrollTo();
const { localeProperties } = useI18n();
const route = useRoute();
const contentful = inject("$contentful");

const ENTRIES_PER_PAGE = 24;
const ENTRIES_PER_SECTION = 8;

const selectedTags = computed(() => {
  return route.query.tags?.split(",") || [];
});

const typeLookup = {
  news: { type: "BlogPosting" },
  project: { type: "ProjectPage" },
  story: { type: "Story" },
  exhibition: { type: "ExhibitionPage" },
  training: { type: "Event", taxonomy: "eventTypeTrainingCourse" },
  event: { type: "Event", taxonomy: "eventTypeEvent" },
};

const selectedType = computed(() => {
  return typeLookup[route.query?.type] || false;
});

// FIXME: this needs to include any tags from the featured entry too
const filteredTags = computed(() => {
  const relevantTags = filteredMinimalEntries.value
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
  const sliceFrom = (page.value - 1) * ENTRIES_PER_PAGE;
  const sliceTo = sliceFrom + ENTRIES_PER_PAGE;
  return filteredMinimalEntries.value
    ?.slice(sliceFrom, sliceTo)
    ?.map((contentEntry) => contentEntry.sys.id);
});

const fetchableSysIdsString = computed(() => {
  return fetchableSysIds.value?.join("-");
});

const filteredMinimalEntries = computed(() => {
  let filteredMinimalEntries = minimalEntries.value;

  // Filter by selected type
  if (selectedType.value) {
    filteredMinimalEntries = filteredMinimalEntries.filter((contentEntry) => {
      if (!entryHasContentType(contentEntry, selectedType.value.type)) {
        return false;
      }
      if (!selectedType.value.taxonomy) {
        return true;
      }
      return entryHasTaxonomyTerm(contentEntry, selectedType.value.taxonomy);
    });
  }

  // Filter by selected categories
  if (selectedTags.value.length > 0) {
    filteredMinimalEntries = filteredMinimalEntries.filter((contentEntry) => {
      return selectedTags.value.every((tag) => contentEntry.cats.includes(tag));
    });
  }

  return filteredMinimalEntries;
});

const total = computed(() => {
  return (
    (filteredMinimalEntries.value?.length || 0) +
    (showFeaturedEntry.value ? 1 : 0)
  );
});

const page = computed(() => {
  return Number(route.query.page || 1);
});

const featuredEntryTags = computed(() => {
  return (
    props.featuredEntry?.categoriesCollection?.items?.map(
      (cat) => cat.identifier,
    ) || []
  );
});

const featuredEntryMatchesSelectedTags = computed(() => {
  return (
    selectedTags.value.length === 0 ||
    selectedTags.value.every((tag) => featuredEntryTags.value.includes(tag))
  );
});

const showFeaturedEntry = computed(() => {
  // no featured entry; nothing to show
  if (!props.featuredEntry) {
    return false;
  }
  // not on 1st page; don't show
  if (!isFirstPage.value) {
    return false;
  }
  // tags are selected but featured entry does not have them all; don't show
  if (!featuredEntryMatchesSelectedTags.value) {
    return false;
  }
  // no content type is selected; show
  if (!selectedType.value) {
    return true;
  }
  // content type is selected, but featured entry is of a different type; don't show
  if (!entryHasContentType(props.featuredEntry, selectedType.value.type)) {
    return false;
  }
  // content type is selected, and has no taxonomy; show
  if (!selectedType.value.taxonomy) {
    return true;
  }
  // show if featured entry has the selected type taxonomy term, else not
  // FIXME: this needs to check for the eventType taxonomy only
  return entryHasTaxonomyTerm(props.featuredEntry, selectedType.value.taxonomy);
});

const featuredEntryText = computed(() => {
  if (props.featuredEntry.datePublished) {
    return t("authored.createdDate", {
      date: d(props.featuredEntry.datePublished, "short"),
    });
  } else if (props.featuredEntry.headline) {
    return props.featuredEntry.headline;
  } else if (
    entryHasTaxonomyTerm(props.featuredEntry, typeLookup.training.taxonomy)
  ) {
    return trainingDateHelper(
      props.featuredEntry.startDate,
      props.featuredEntry.endDate,
    );
  } else if (
    entryHasTaxonomyTerm(props.featuredEntry, typeLookup.event.taxonomy)
  ) {
    return eventDateHelper(
      props.featuredEntry.startDate,
      props.featuredEntry.endDate,
    );
  }
  return undefined;
});

const featuredEntryImage = computed(() => {
  if (props.featuredEntry?.primaryImageOfPage?.image) {
    return props.featuredEntry?.primaryImageOfPage?.image;
  } else if (props.featuredEntry?.image) {
    return props.featuredEntry?.image;
  }
  return undefined;
});

const featuredEntryUrl = computed(() => {
  if (props.featuredEntry.url) {
    return props.featuredEntry.url;
  }
  return entryUrl(props.featuredEntry);
});

const featuredEntrySubTitle = computed(() => {
  if (!entryHasContentType(props.featuredEntry, "Event")) {
    return undefined;
  }
  return entryHasTaxonomyTerm(props.featuredEntry, typeLookup.training.taxonomy)
    ? t("training.label")
    : t("event.label");
});

async function fetchFullEntries() {
  if (fetchableSysIds.value.length === 0) {
    return [];
  }
  // Fetch full data for display of page of content entries
  const contentVariables = {
    locale: localeProperties.value.language,
    preview: route.query.mode === "preview",
    limit: ENTRIES_PER_PAGE,
    ids: fetchableSysIds.value,
    site: props.site,
  };

  const contentResponse = await contentful.query(
    contentBySysIdGraphql,
    contentVariables,
  );

  return Object.values(contentResponse.data)
    .map((collection) => collection.items || [])
    .flat();
}

const normalisedEntries = computed(() => {
  return fetchableSysIds.value
    .map((sysId) =>
      normaliseCard(
        fullEntries.value.find(
          (contentEntry) => contentEntry?.sys?.id === sysId,
        ),
      ),
    )
    .filter(Boolean);
});

const isFilteredByTag = computed(() => selectedTags.value.length > 0);
const isFilteredByType = computed(() => !!selectedType.value);
const isFirstPage = computed(() => page.value === 1);
const hasCtaBanners = computed(() => props.ctaBanners.length > 0);
const displayCtaBanners = computed(
  () =>
    hasCtaBanners.value &&
    isFirstPage.value &&
    !isFilteredByTag.value &&
    !isFilteredByType.value,
);

// This creates an array of card arrays and 'cta-banner' placeholders to create a layout of containers with cards and full width CTA banners.
const contentSections = computed(() => {
  if (!displayCtaBanners.value) {
    return [normalisedEntries.value];
  }

  const sections = [];
  let entryStartIndex = 0;

  for (const ctaBanner of props.ctaBanners) {
    sections.push(
      normalisedEntries.value.slice(
        entryStartIndex,
        entryStartIndex + ENTRIES_PER_SECTION,
      ),
      ctaBanner,
    );
    entryStartIndex = entryStartIndex + ENTRIES_PER_SECTION;
  }

  // add any remaining e.g. if few CTAs
  if (normalisedEntries.value.slice(entryStartIndex).length > 0) {
    sections.push(normalisedEntries.value.slice(entryStartIndex));
  }

  return sections;
});

function trainingDateHelper(startDate, endDate) {
  if (startDate) {
    let formatedEndDate = t("training.ongoing");
    if (endDate) {
      formatedEndDate = d(endDate, "short");
    }
    return t("training.dateRange", {
      startDate: d(startDate, "short"),
      endDate: formatedEndDate,
    });
  }
  return t("training.ongoing");
}

function eventDateHelper(startDate, endDate) {
  if (endDate) {
    return t("event.dateRange", {
      startDate: d(startDate, "short"),
      endDate: d(endDate, "short"),
    });
  }
  return d(startDate, "short");
}

// TODO: Only works for blogPostings/projects/training/events:
//       make distinct normalisation functions per supported type;
//       consider passing a normalisation function in per type as a prop.
function normaliseCard(entry) {
  if (entry) {
    if (entryHasContentType(entry, "BlogPosting")) {
      return {
        ...entry,
        url: entryUrl(entry),
        text: t("authored.createdDate", {
          date: d(entry.datePublished, "short"),
        }),
        primaryImageOfPage:
          entry.primaryImageOfPage || props.defaultCardThumbnail,
      };
    } else if (entryHasContentType(entry, "ProjectPage")) {
      return {
        ...entry,
        url: entryUrl(entry),
        text: entry.headline,
        primaryImageOfPage:
          entry.primaryImageOfPage || props.defaultCardThumbnail,
      };
    } else if (entryHasContentType(entry, "Event")) {
      if (entryHasTaxonomyTerm(entry, typeLookup.training.taxonomy)) {
        return {
          ...entry,
          url: entry.url,
          subTitle: t("training.label"),
          text: trainingDateHelper(entry.startDate, entry.endDate),
          primaryImageOfPage: {
            image: entry.image || props.defaultCardThumbnail.image,
          },
        };
      }
      return {
        ...entry,
        url: entry.url,
        subTitle: t("event.label"),
        text: eventDateHelper(entry.startDate, entry.endDate),
        primaryImageOfPage: {
          image: entry.image || props.defaultCardThumbnail.image,
        },
      };
    }
  }
}

// Fetch minimal data for all entries to support ordering by datePublished
// and filtering by categories.
async function fetchMinimalEntries() {
  const contentIdsVariables = {
    excludeSysId: props.featuredEntry?.sys?.id || "",
    locale: localeProperties.value.language,
    preview: route.query.mode === "preview",
    site: props.site,
  };
  // Splits the request into seperate graphql queries as otherwise
  // the maximum allowed complexity for a query of 11000 is exeeded.
  // TODO: when selectedType is already set, only retrieve those entries
  // needs to be accounted for in: { data: minimalEntries } = useAsyncData(...)

  const contentTypeGraphql = {
    "blog post": blogPostingsListingMinimalGraphql,
    project: projectPagesListingMinimalGraphql,
    event: eventsListingMinimalGraphql,
    training: trainingsListingMinimalGraphql,
  };

  const contentIds = (
    await Promise.all(
      supportedContentTypes.value.map((ctype) =>
        contentful.query(contentTypeGraphql[ctype], contentIdsVariables),
      ),
    )
  )
    .map((response) => response.data[Object.keys(response.data)[0]].items || [])
    .flat();

  // TODO: Re-implement retrieval for:
  // storiesResponse.data.storyCollection?.items,
  // exhibitionsResponse.data.exhibitionPageCollection?.items,

  // Simplify categories
  for (const contentEntry of contentIds) {
    if (contentEntry.cats?.items) {
      contentEntry.cats = contentEntry.cats.items
        .filter((cat) => !!cat)
        .map((cat) => cat.id);
    }
  }

  // Order by date published
  const ordered = contentIds.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return ordered;
}

const { data: minimalEntries, error: minimalEntriesError } = await useAsyncData(
  "minimalEntries",
  fetchMinimalEntries,
  { default: () => [] },
);
if (minimalEntriesError.value) {
  throw createHttpError(
    minimalEntriesError.value.statusCode,
    minimalEntriesError.value,
  );
}

const { data: fullEntries, error: fullEntriesError } = await useAsyncData(
  fetchableSysIdsString,
  fetchFullEntries,
  {
    default: () => [],
    watch: [fetchableSysIdsString],
  },
);
if (fullEntriesError.value) {
  throw createHttpError(
    fullEntriesError.value.statusCode,
    fullEntriesError.value,
  );
}

watch(page, () => {
  scrollToSelector("#header");
});
</script>

<template>
  <div id="content-interface">
    <div class="container">
      <NuxtErrorBoundary>
        <ContentTagsFilter
          :filtered-tags="filteredTags"
          :selected-tags="selectedTags"
        />
        <template #error="{ error }">
          <GenericAlertMessage :error="error" />
        </template>
      </NuxtErrorBoundary>
      <div
        class="d-flex justify-content-between align-items-center mb-4 mb-4k-5"
      >
        <span class="context-label">
          {{ $t("results", total, { count: total }) }}
        </span>
        <ContentTypeFilter :content-types="supportedContentTypes" />
        <output form="tags-search-form" class="visually-hidden">
          {{ $t("content.resultsHaveLoaded", [total]) }}
        </output>
      </div>
      <!--LoadingSpinner
      v-if="$fetchState.pending"
      class="container position-absolute flex-md-row py-4 text-center"
    /-->
    </div>
    <div v-if="showFeaturedEntry" class="container mb-4 mb-lg-5 pb-4k-5">
      <ContentFeaturedCard
        :title="props.featuredEntry?.name"
        :text="featuredEntryText"
        :image="featuredEntryImage"
        :sub-title="featuredEntrySubTitle"
        :url="featuredEntryUrl"
      />
    </div>
    <template v-for="(section, index) in contentSections">
      <!-- eslint-disable vue/valid-v-for -->
      <transition appear name="fade">
        <!-- eslint-enable vue/valid-v-for -->
        <div
          v-if="entryHasContentType(section, 'PrimaryCallToAction')"
          :key="`cta-banner-${index}`"
          class="cta-banner-wrapper my-4 my-lg-5 py-4k-5"
        >
          <GenericCallToActionBanner
            v-if="ctaBanners.length"
            :name="section.name"
            :name-english="section.nameEN"
            :title="section.name"
            :text="section.text"
            :link="section.relatedLink"
            :illustration="section.image"
            :background-image="section.image"
          />
        </div>
        <div v-else :key="`entry-${index}`" class="container">
          <div class="row g-4 g-4k-5 row-cols-1 row-cols-md-2 row-cols-lg-4">
            <div v-for="entry in section" :key="entry.sysId" class="col">
              <ContentCard
                :title="entry.name"
                :sub-title="entry.subTitle"
                :url="entry.url"
                :text="entry.text"
                :image-url="
                  entry.primaryImageOfPage && entry.primaryImageOfPage.image.url
                "
                :image-content-type="
                  entry.primaryImageOfPage &&
                  entry.primaryImageOfPage.image.contentType
                "
              />
            </div>
          </div>
        </div>
      </transition>
    </template>
    <PaginationNavInput
      v-if="total > ENTRIES_PER_PAGE"
      :per-page="ENTRIES_PER_PAGE"
      :total-items="total"
      class="mt-4 mt-lg-5 pt-4k-5"
    />
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "@europeana/style/scss/transitions";
</style>
