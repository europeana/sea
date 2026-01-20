<script setup>
import { uniq } from "lodash-es";
import useScrollTo from "@/composables/scrollTo.js";
import { createHttpError } from "@/composables/error.js";
import blogPostingsListingGraphql from "@/graphql/queries/blogPostingsListing.graphql";
import eventsListingGraphql from "@/graphql/queries/eventsListing.graphql";
import exhibitionsListingGraphql from "@/graphql/queries/exhibitionsListing.graphql";
import projectPagesListingGraphql from "@/graphql/queries/projectPagesListing.graphql";
import storiesListingGraphql from "@/graphql/queries/storiesListing.graphql";
import trainingsListingGraphql from "@/graphql/queries/trainingsListing.graphql";
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
import routeForType from "@/utils/contentRoute.js";

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

const supportedContentTypes = computed(() =>
  props.contentTypes.filter((ct) =>
    ["blog post", "project", "training", "event"].includes(ct),
  ),
);

const { scrollToSelector } = useScrollTo();
const { localeProperties } = useI18n();
const route = useRoute();
const contentful = inject("$contentful");

const ENTRIES_PER_PAGE = 24;
const ENTRIES_PER_SECTION = 4;

const selectedTags = computed(() => {
  return route.query.tags?.split(",") || [];
});

const typeLookup = {
  news: { type: "BlogPosting" },
  "blog post": { type: "BlogPosting" },
  project: { type: "ProjectPage" },
  story: { type: "Story" },
  exhibition: { type: "ExhibitionPage" },
  training: { type: "Event", taxonomy: "eventTypeTrainingCourse" },
  event: { type: "Event", taxonomy: "eventTypeEvent" },
};

const typeSectionLookup = {
  BlogPosting: {
    url: routeForType(route, "news"),
    title: t("news"),
  },
  ProjectPage: {
    url: routeForType(route, "project"),
    title: t("projects.projects"),
  },
  // Story: t(""),
  // ExhibitionPage: t(""),
  eventTypeTrainingCourse: {
    url: routeForType(route, "training"),
    title: t("training.training"),
  },
  eventTypeEvent: {
    url: routeForType(route, "event"),
    title: t("event.events"),
  },
};

const selectedType = computed(() => {
  return typeLookup[route.query?.type] || false;
});

const supportedTaxonomiesAndTypes = computed(() => {
  return supportedContentTypes.value.map(
    (type) => typeLookup[type].taxonomy || typeLookup[type].type,
  );
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
    (fullEntries.value.total ||
      // when full entries is array of entry sections, get the sum of totals
      fullEntries.value.reduce?.((memo, collection) => {
        return memo + collection.total;
      }, 0) ||
      0) + (featuredEntryInResults.value ? 1 : 0)
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

const featuredEntryInResults = computed(() => {
  // no featured entry; not present
  if (!props.featuredEntry) {
    return false;
  }
  // tags are selected but featured entry does not have them all; not present
  if (!featuredEntryMatchesSelectedTags.value) {
    return false;
  }
  // selected type or taxonomy matches featured entry type or taxonomy; present
  if (
    selectedType.value &&
    (entryHasTaxonomyTerm(props.featuredEntry, selectedType.value.taxonomy) ||
      entryHasContentType(props.featuredEntry, selectedType.value.type))
  ) {
    return true;
  }
  // no selected type; present
  if (!selectedType.value) {
    return true;
  }
  return false;
});

function displayFeaturedEntry(sectionType) {
  // featured entry in results and on first page
  if (featuredEntryInResults.value && isFirstPage.value) {
    // and type is selected; show
    if (selectedType.value) {
      return true;
    }
    // and section type matches featured entry type; show
    if (
      sectionType &&
      (entryHasTaxonomyTerm(props.featuredEntry, sectionType) ||
        entryHasContentType(props.featuredEntry, sectionType))
    ) {
      return true;
    }
  }
  return false;
}

const featuredEntryText = computed(() => {
  if (props.featuredEntry.datePublished) {
    return t("authored.publishedDate", {
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
  const selectedTaxonomyOrType =
    selectedType.value?.taxonomy || selectedType.value?.type;

  const contentVariables = {
    locale: localeProperties.value.language,
    preview: route.query.mode === "preview",
    limit: selectedTaxonomyOrType ? ENTRIES_PER_PAGE : ENTRIES_PER_SECTION,
    skip: (page.value - 1) * ENTRIES_PER_PAGE,
    categoriesFilter: null,
    excludeSysId: props.featuredEntry?.sys?.id || "",
    site: selectedTaxonomyOrType === "BlogPosting" ? props.site : null,
  };

  if (selectedTags.value.length) {
    contentVariables.categoriesFilter = selectedTags.value.map((cat) => ({
      categories: { identifier: cat },
    }));
  }

  const contentTypeGraphql = {
    BlogPosting: blogPostingsListingGraphql,
    ProjectPage: projectPagesListingGraphql,
    eventTypeEvent: eventsListingGraphql,
    eventTypeTrainingCourse: trainingsListingGraphql,
    ExhibitionPage: exhibitionsListingGraphql,
    Story: storiesListingGraphql,
  };

  return await Promise.all(
    []
      .concat(selectedTaxonomyOrType || supportedTaxonomiesAndTypes.value)
      .map(async (taxonomyOrType) => {
        const res = await contentful.query(
          contentTypeGraphql[taxonomyOrType],
          contentVariables,
        );

        // Save type to response
        const responseData = Object.values(res.data)[0];
        return {
          ...responseData,
          type: taxonomyOrType,
        };
      }),
  );
}

function normalisedEntryCards(entries = []) {
  return entries.map((entry) => normaliseCard(entry)).filter(Boolean);
}

const normalisedSections = computed(() => {
  return fullEntries.value.map((collection) => ({
    entries: normalisedEntryCards(collection.items),
    type: collection.type,
    total: collection.total,
  }));
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

// This creates an array of card arrays per type and 'cta-banner' placeholders to create a layout of containers with cards and full width CTA banners.
const contentSections = computed(() => {
  if (isFilteredByType.value) {
    return normalisedSections.value;
  }

  const sections = [];
  let typeSectionStartIndex = 0;

  if (displayCtaBanners.value) {
    for (const ctaBanner of props.ctaBanners) {
      sections.push(
        normalisedSections.value[typeSectionStartIndex],
        normalisedSections.value[typeSectionStartIndex + 1],
        ctaBanner,
      );
      typeSectionStartIndex = typeSectionStartIndex + 2;
    }
  }

  // add any remaining e.g. if no or few CTAs
  if (normalisedSections.value.slice(typeSectionStartIndex).length > 0) {
    normalisedSections.value.slice(typeSectionStartIndex).forEach((section) => {
      sections.push(section);
    });
  }

  return sections.filter(Boolean);
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
        text: t("authored.publishedDate", {
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
            image: entry.image || props.defaultCardThumbnail?.image,
          },
        };
      }
      return {
        ...entry,
        url: entry.url,
        subTitle: t("event.label"),
        text: eventDateHelper(entry.startDate, entry.endDate),
        primaryImageOfPage: {
          image: entry.image || props.defaultCardThumbnail?.image,
        },
      };
    }
  }
}

// Fetch minimal data for all entries to support filtering by categories.
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

  return contentIds;
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
  "fullEntries",
  fetchFullEntries,
  {
    default: () => [],
    watch: [selectedTags, selectedType, page],
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

function renderSection(section) {
  return section?.total > 0 || displayFeaturedEntry(section.type);
}

function renderMoreLink(section) {
  return typeSectionLookup[section.type] && section?.total > 4;
}

function getMoreLinkLabelForSection(section) {
  if (selectedTags.value.length) {
    return t("content.seeMore", {
      content: typeSectionLookup[section.type].title,
    });
  } else {
    return t("content.seeAll", {
      content: typeSectionLookup[section.type].title,
    });
  }
}
</script>

<template>
  <div id="content-interface" :class="{ 'mb-5 pb-4k-5': selectedType }">
    <NuxtErrorBoundary>
      <ContentTagsFilter
        :filtered-tags="filteredTags"
        :selected-tags="selectedTags"
      />
      <template #error="{ error }">
        <div class="container">
          <GenericAlertMessage :error="error" />
        </div>
      </template>
    </NuxtErrorBoundary>
    <div class="container">
      <div class="d-flex justify-content-end align-items-center mb-4 mb-4k-5">
        <span v-if="selectedType" class="context-label ms-0 me-auto">
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
        <div
          v-else-if="renderSection(section)"
          :key="`section-${section.type}`"
          class="container mb-5 pb-4k-5"
        >
          <h2 v-if="typeSectionLookup[section.type]" class="section-title">
            {{ typeSectionLookup[section.type].title }}
          </h2>
          <ContentFeaturedCard
            v-if="displayFeaturedEntry(section.type)"
            class="mb-4 mb-lg-5"
            :title="props.featuredEntry?.name"
            :text="featuredEntryText"
            :image="featuredEntryImage"
            :sub-title="featuredEntrySubTitle"
            :url="featuredEntryUrl"
          />
          <div class="row g-4 g-4k-5 row-cols-1 row-cols-md-2 row-cols-lg-4">
            <div
              v-for="entry in section.entries"
              :key="entry.sys.id"
              class="col"
            >
              <transition appear name="fade">
                <ContentCard
                  :title="entry.name"
                  :sub-title="entry.subTitle"
                  :url="entry.url"
                  :text="entry.text"
                  :image-url="
                    entry.primaryImageOfPage?.image &&
                    entry.primaryImageOfPage.image.url
                  "
                  :image-content-type="
                    entry.primaryImageOfPage?.image &&
                    entry.primaryImageOfPage.image.contentType
                  "
                />
              </transition>
            </div>
          </div>
          <GenericSmartLink
            v-if="renderMoreLink(section)"
            :destination="typeSectionLookup[section.type].url"
            class="more-link btn btn-secondary icon-chevron"
            >{{ getMoreLinkLabelForSection(section) }}</GenericSmartLink
          >
        </div>
      </transition>
    </template>
    <PaginationNavInput
      v-if="selectedType && total > ENTRIES_PER_PAGE"
      :per-page="ENTRIES_PER_PAGE"
      :total-items="total"
      class="mt-4 mt-lg-5 pt-4k-5"
    />
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "@europeana/style/scss/transitions";

h2.section-title {
  color: $darkgrey;
  margin-bottom: 2rem;

  @media (min-width: $bp-4k) {
    margin-bottom: calc(var(--bp-4k-increment) * 2rem);
  }

  &::after {
    content: "";
    display: block;
    border: 1px solid $lightgrey;
    margin-top: 1.5rem;

    @media (min-width: $bp-4k) {
      border-width: 2px;
      margin-bottom: calc(var(--bp-4k-increment) * 1.5rem);
    }
  }
}

.cta-banner-wrapper:last-child {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.more-link {
  margin-top: 2rem;

  @media (min-width: $bp-4k) {
    margin-top: calc(var(--bp-4k-increment) * 2rem);
  }
}
</style>
