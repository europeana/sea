<script setup>
import { uniq } from "lodash-es";
import useScrollTo from "@/composables/scrollTo.js";
import contentBySysIdGraphql from "@/graphql/queries/contentBySysId.graphql";
import blogPostingsListingMinimalGraphql from "@/graphql/queries/blogPostingsListingMinimal.graphql";
import projectPagesListingMinimalGraphql from "@/graphql/queries/projectPagesListingMinimal.graphql";
import trainingsListingMinimalGraphql from "@/graphql/queries/trainingsListingMinimal.graphql";
import eventsListingMinimalGraphql from "@/graphql/queries/eventsListingMinimal.graphql";
// import exhibitionsListingMinimalGraphql from "@/graphql/queries/exhibitionsListingMinimal.graphql";
// import storiesListingMinimalGraphql from "@/graphql/queries/storiesListingMinimal.graphql";
import { contentfulEntryUrl } from "../../utils/contentful/entry-url.js";
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
  const ret = filteredMinimalEntries.value
    .slice(sliceFrom, sliceTo)
    .map((contentEntry) => contentEntry.sys.id);
  return ret;
});

const fetchableSysIdsString = computed(() => {
  return fetchableSysIds.value.join("-");
});

const filteredMinimalEntries = computed(() => {
  let filteredMinimalEntries = minimalEntries.value || [];

  if (selectedType.value) {
    // Filter by selected type
    filteredMinimalEntries = filteredMinimalEntries.filter((contentEntry) => {
      return (
        contentEntry["__typename"] === selectedType.value.type &&
        (contentEntry.contentfulMetadata?.concepts.length > 0
          ? contentEntry.contentfulMetadata.concepts.some((taxonomy) => {
              return taxonomy.id === selectedType.value.taxonomy;
            })
          : true)
      );
    });
  }

  if (selectedTags.value.length > 0) {
    // Filter by selected categories
    filteredMinimalEntries = filteredMinimalEntries.filter((contentEntry) => {
      return selectedTags.value.every((tag) => contentEntry.cats.includes(tag));
    });
  }

  return filteredMinimalEntries;
});

const total = computed(() => {
  return filteredMinimalEntries.value?.length || 0;
});

const page = computed(() => {
  return Number(route.query.page || 1);
});

const showFeaturedEntry = computed(() => {
  let featuredEntryMatchesSelectedTags = true;
  const featuredEntryTags =
    props.featuredEntry?.categoriesCollection?.items?.map(
      (cat) => cat.identifier,
    ) || [];
  if (selectedTags.value.length > 0) {
    featuredEntryMatchesSelectedTags = selectedTags.value.every((tag) =>
      featuredEntryTags.includes(tag),
    );
  }

  return (
    props.featuredEntry &&
    (!selectedType.value ||
      selectedType.value.type === props.featuredEntry.__typename) &&
    featuredEntryMatchesSelectedTags &&
    page.value === 1
  );
});

const featuredEntryText = computed(() => {
  if (props.featuredEntry.datePublished) {
    return t("authored.createdDate", {
      date: d(props.featuredEntry.datePublished, "short"),
    });
  } else {
    return props.featuredEntry.headline;
  }
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
        (fullEntries.value || []).find(
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

function isCtaBanner(entry) {
  return entry["__typename"] === "PrimaryCallToAction";
}

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
    if (entry.__typename === "BlogPosting") {
      return {
        ...entry,
        url: contentfulEntryUrl(entry),
        text: t("authored.createdDate", {
          date: d(entry.datePublished, "short"),
        }),
        primaryImageOfPage:
          entry.primaryImageOfPage || props.defaultCardThumbnail,
      };
    } else if (entry.__typename === "ProjectPage") {
      return {
        ...entry,
        url: contentfulEntryUrl(entry),
        text: entry.headline,
        primaryImageOfPage:
          entry.primaryImageOfPage || props.defaultCardThumbnail,
      };
    } else if (entry.__typename === "Event") {
      if (
        entry.contentfulMetadata.concepts[0].id === typeLookup.training.taxonomy
      ) {
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
      props.contentTypes.map((ctype) =>
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

const { data: minimalEntries } = useAsyncData(
  "minimalEntries",
  fetchMinimalEntries,
);
const { data: fullEntries } = useAsyncData(
  fetchableSysIdsString,
  fetchFullEntries,
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
    <div class="container">
      <client-only>
        <ContentTagsDropdown
          :filtered-tags="filteredTags"
          :selected-tags="selectedTags"
        />
      </client-only>
      <div
        class="d-flex justify-content-between align-items-center mb-4 mb-4k-5"
      >
        <span class="context-label">
          {{ $t("results", total, { count: total }) }}
        </span>
        <ContentTypeFilter :content-types="contentTypes" />
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
        :image="props.featuredEntry?.primaryImageOfPage?.image"
        :url="contentfulEntryUrl(props.featuredEntry)"
      />
    </div>
    <template v-for="(section, index) in contentSections">
      <!-- eslint-disable vue/valid-v-for -->
      <transition appear name="fade">
        <!-- eslint-enable vue/valid-v-for -->
        <div
          v-if="isCtaBanner(section)"
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
@import "assets/scss/variables";

.context-label {
  font-size: $font-size-small;

  @media (min-width: $bp-4k) {
    font-size: $font-size-small-4k;
  }
}
</style>
