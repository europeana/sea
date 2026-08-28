<script setup>
import useScrollTo from "@/composables/scrollTo.js";
import { createHttpError } from "@/composables/error.js";
import blogPostingsListingGraphql from "@/graphql/queries/blogPostingsListing.graphql";
import eventsListingGraphql from "@/graphql/queries/eventsListing.graphql";
import projectPagesListingGraphql from "@/graphql/queries/projectPagesListing.graphql";
import trainingsListingGraphql from "@/graphql/queries/trainingsListing.graphql";

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
  return route.query.tags?.split(",").sort() || [];
});

const typeLookup = {
  news: { type: "BlogPosting" },
  "blog post": { type: "BlogPosting" },
  project: { type: "ProjectPage" },
  training: { type: "Event", taxonomy: "eventTypeTrainingCourse" },
  event: { type: "Event", taxonomy: "eventTypeEvent" },
};

const typeSectionLookup = computed(() => {
  return {
    BlogPosting: {
      url: routeForType(route, "news"),
      title: t("news", 2),
    },
    ProjectPage: {
      url: routeForType(route, "project"),
      title: t("project", 2),
    },
    eventTypeTrainingCourse: {
      url: routeForType(route, "training"),
      title: t("training.training", 2),
    },
    eventTypeEvent: {
      url: routeForType(route, "event"),
      title: t("event.event", 2),
    },
  };
});

const selectedType = computed(() => {
  return typeLookup[route.query?.type] || false;
});

const selectedTaxonomyOrType = computed(
  () => selectedType.value?.taxonomy || selectedType.value?.type,
);

const supportedTaxonomiesAndTypes = computed(() => {
  return supportedContentTypes.value.map(
    (type) => typeLookup[type].taxonomy || typeLookup[type].type,
  );
});

const categoriesFilter = computed(() => {
  if (selectedTags.value.length) {
    return selectedTags.value.map((cat) => ({
      categories: { identifier: cat },
    }));
  }
  return null;
});

const sectionEntries = computed(() => fullEntries.value);

const total = computed(() => {
  return (
    sectionEntries.value.reduce((memo, collection) => {
      return memo + collection.total + (collection.featuredEntry ? 1 : 0);
    }, 0) || 0
  );
});

const page = computed(() => {
  return Number(route.query.page || 1);
});

function displayFeaturedEntry(section) {
  // featured entries in results and on first page
  if (section.featuredEntry && isFirstPage.value) {
    return true;
  }
  return false;
}

const fetchEntries = async (variables) => {
  const contentVariables = {
    locale: localeProperties.value.language,
    preview: route.query?.mode === "preview",
    categoriesFilter: categoriesFilter.value,
    site: selectedTaxonomyOrType.value === "BlogPosting" ? props.site : null,
    ...variables,
  };

  const contentTypeGraphql = {
    BlogPosting: blogPostingsListingGraphql,
    ProjectPage: projectPagesListingGraphql,
    eventTypeEvent: eventsListingGraphql,
    eventTypeTrainingCourse: trainingsListingGraphql,
  };

  return await Promise.all(
    []
      .concat(selectedTaxonomyOrType.value || supportedTaxonomiesAndTypes.value)
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
};

const fetchFeaturedEntries = async () => {
  const contentVariables = {
    limit: 1,
    tagsFilter: {
      contentfulMetadata: { tags: { id_contains_some: ["featured"] } },
    },
  };

  return await fetchEntries(contentVariables);
};

const fetchFullEntries = async () => {
  const featuredEntries = await fetchFeaturedEntries();

  const contentVariables = {
    limit: selectedTaxonomyOrType.value
      ? ENTRIES_PER_PAGE
      : ENTRIES_PER_SECTION,
    skip: (page.value - 1) * ENTRIES_PER_PAGE,
    excludeSysIds: featuredEntries.map((entry) => entry?.items[0]?.sys?.id),
  };

  const sectionEntries = await fetchEntries(contentVariables);
  sectionEntries.forEach((section) => {
    section.featuredEntry = featuredEntries.find(
      (entry) => entry.type === section.type,
    )?.items[0];
  });
  return sectionEntries;
};

function normalisedEntryCards(entries = []) {
  return entries.map((entry) => normaliseCard(entry)).filter(Boolean);
}

const normalisedSections = computed(() => {
  return sectionEntries.value.map((collection) => ({
    entries: normalisedEntryCards(collection.items),
    featuredEntry: normaliseCard(collection.featuredEntry),
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
          entry.primaryImageOfPage || entry.image || props.defaultCardThumbnail,
      };
    } else if (entryHasContentType(entry, "ProjectPage")) {
      return {
        ...entry,
        url: entryUrl(entry),
        text: entry.headline,
        primaryImageOfPage:
          entry.primaryImageOfPage || entry.image || props.defaultCardThumbnail,
      };
    } else if (entryHasContentType(entry, "Event")) {
      if (entryHasTaxonomyTerm(entry, typeLookup.training.taxonomy)) {
        return {
          ...entry,
          url: entry.url,
          subTitle: t("training.training"),
          text: trainingDateHelper(entry.startDate, entry.endDate),
          primaryImageOfPage: {
            image: entry.image || props.defaultCardThumbnail?.image,
          },
        };
      }
      return {
        ...entry,
        url: entry.url,
        subTitle: t("event.event"),
        text: eventDateHelper(entry.startDate, entry.endDate),
        primaryImageOfPage: {
          image: entry.image || props.defaultCardThumbnail?.image,
        },
      };
    }
  }
}
// data is refetched when key changes
const fullEntriesKey = computed(
  () =>
    `fullEntries-${selectedTaxonomyOrType.value || "all"}-${selectedTags.value.join("-") || "all"}-${page.value}`,
);
const { data: fullEntries, error: fullEntriesError } = await useAsyncData(
  fullEntriesKey,
  fetchFullEntries,
  {
    default: () => {},
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
  return section?.total > 0 || displayFeaturedEntry(section);
}

function renderMoreLink(section) {
  return (
    !selectedType.value &&
    typeSectionLookup.value[section.type] &&
    section?.total > 4
  );
}

function renderTypeTitle(type) {
  return !selectedType.value && typeSectionLookup.value[type];
}

function getMoreLinkLabelForSection(section) {
  if (selectedTags.value.length) {
    return t("content.seeMore", {
      content: typeSectionLookup.value[section.type].title,
    });
  } else {
    return t("content.seeAll", {
      content: typeSectionLookup.value[section.type].title,
    });
  }
}
</script>

<template>
  <div id="content-interface" :class="{ 'mb-5 pb-4k-5': selectedType }">
    <NuxtErrorBoundary>
      <ContentTagsFilter
        :selected-tags="selectedTags"
        :selected-taxonomy-or-type="selectedTaxonomyOrType"
        :supported-taxonomies-and-types="supportedTaxonomiesAndTypes"
        :site="site"
      />
      <template #error="{ error }">
        <div class="container">
          <GenericAlertMessage :error="error" />
        </div>
      </template>
    </NuxtErrorBoundary>
    <div class="container">
      <div class="d-flex justify-content-end align-items-center mb-4 mb-4k-5">
        <transition appear name="fade">
          <span v-if="selectedType" class="context-label ms-0 me-auto">
            {{ $t("results", total, { count: total }) }}
          </span>
        </transition>
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
    <div v-if="total < 1" class="err-mess container mb-5">
      <slot name="error-message" />
    </div>
    <template v-for="(section, index) in contentSections" v-else>
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
        <transition-group appear name="fade">
          <h2 v-if="renderTypeTitle(section.type)" class="section-title">
            {{ typeSectionLookup[section.type].title }}
          </h2>
          <ContentFeaturedCard
            v-if="displayFeaturedEntry(section)"
            class="mb-4 mb-lg-5"
            :title="section.featuredEntry.name"
            :text="section.featuredEntry.text"
            :image="section.featuredEntry.primaryImageOfPage.image"
            :sub-title="section.featuredEntry.subTitle"
            :url="section.featuredEntry.url"
          />
        </transition-group>
        <div class="row g-4 g-4k-5 row-cols-1 row-cols-md-2 row-cols-lg-4">
          <div v-for="entry in section.entries" :key="entry.sys.id" class="col">
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
