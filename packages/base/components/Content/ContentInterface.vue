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
const CTA_BANNER = "cta-banner";

const ctaBanner = CTA_BANNER;
const perPage = 24;
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

  const fullContent = Object.values(contentResponse.data)
    .map((collection) => collection.items || [])
    .flat();

  const retrievedContentEntries = contentSysIds
    .map((sysId) =>
      normaliseCard(
        fullContent.find((contentEntry) => contentEntry?.sys?.id === sysId),
      ),
    )
    .filter(Boolean);

  // This creates an array of card arrays and 'cta-banner' placeholders to create a layout of containers with cards and full width CTA banners.
  const entriesWithCtaBanners = [];
  if (
    props.ctaBanners.length &&
    page.value === 1 &&
    selectedTags.value.length === 0 &&
    !selectedType.value
  ) {
    for (let i = 0; i < props.ctaBanners.length; i = i + 1) {
      entriesWithCtaBanners.push(
        retrievedContentEntries.slice(i * 8, (i + 1) * 8),
        `${ctaBanner}-${i}`,
      );
    }
  } else {
    entriesWithCtaBanners.push(retrievedContentEntries);
  }

  return entriesWithCtaBanners;
}

function isCtaBanner(entry) {
  return typeof entry === "string" && entry.startsWith(ctaBanner);
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

async function fetchContentMetadata() {
  // Fetch minimal data for all entries to support ordering by datePublished
  // and filtering by categories.
  const contentIdsVariables = {
    excludeSysId: props.featuredEntry?.sys?.id || "",
    locale: localeProperties.value.language,
    preview: route.query.mode === "preview",
    site: props.site,
  };
  // Splits the request into seperate graphql queries as otherwise
  // the maximum allowed complexity for a query of 11000 is exeeded.
  // TODO: when selectedType is already set, only retrieve those entries
  // needs to be accounted for in: { data: allContentMetadata } = useAsyncData(...)

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
    <template v-for="(section, index) in contentEntries">
      <!-- eslint-disable vue/valid-v-for -->
      <transition appear name="fade">
        <!-- eslint-enable vue/valid-v-for -->
        <div
          v-if="isCtaBanner(section)"
          :key="section"
          class="cta-banner-wrapper my-4 my-lg-5 py-4k-5"
        >
          <GenericCallToActionBanner
            v-if="ctaBanners.length"
            :name="ctaBanners[section.slice(-1)].name"
            :name-english="ctaBanners[section.slice(-1)].nameEN"
            :title="ctaBanners[section.slice(-1)].name"
            :text="ctaBanners[section.slice(-1)].text"
            :link="ctaBanners[section.slice(-1)].relatedLink"
            :illustration="ctaBanners[section.slice(-1)].image"
            :background-image="ctaBanners[section.slice(-1)].image"
          />
        </div>
        <div v-else :key="index" class="container">
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
      v-if="total > perPage"
      :per-page="perPage"
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
