<script setup>
import { omit } from "lodash-es";

const props = defineProps({
  /**
   * Number of items per page
   */
  perPage: {
    type: Number,
    default: 24,
  },
  /**
   * Total number of results
   */
  totalItems: {
    type: Number,
    default: 0,
  },
  /**
   * Maximum number of results to show
   */
  maxResults: {
    type: Number,
    default: null,
  },
  /**
   * Icon to use for the previous/next buttons. Set to null to hide the icon
   * @values icon-arrow-down, icon-arrow-outline
   */
  buttonIconClass: {
    type: String,
    default: "icon-arrow-down",
  },
  /**
   * If true, show text on the previous/next buttons
   */
  buttonText: {
    type: Boolean,
    default: true,
  },
  /**
   * If true, add an input field for the page number
   */
  pageInput: {
    type: Boolean,
    default: true,
  },
  /**
   * If true, show progress indicator
   */
  progress: {
    type: Boolean,
    default: false,
  },
  /**
   * Array of url params to exclude on pagination
   */
  excludeParams: {
    type: Array,
    default: () => [],
  },
});

const route = useRoute();
const router = useRouter();

const nextLinkId = "pagination-nav-input-next";
const prevLinkId = "pagination-nav-input-previous";

const page = ref(null);
watchEffect(() => {
  page.value = Number(route.query.page) || 1;
});
const showPagination = computed(() => props.totalItems > props.perPage);
const totalPages = computed(() => {
  const atLeastOne = Math.max(props.totalItems, 1);
  return Math.ceil(
    Math.min(atLeastOne, props.maxResults || atLeastOne) / props.perPage,
  );
});

const prevDisabled = computed(() => page.value <= 1);
const nextDisabled = computed(() => page.value >= totalPages.value);

const prevUrl = computed(() => linkGen(page.value - 1));
const nextUrl = computed(() => linkGen(page.value + 1));

const handlePageInputChange = () => {
  if (page.value) {
    router.push(linkGen(page.value));
  }
};

const linkGen = (page) => {
  const query = omit({ ...route.query, page }, props.excludeParams);

  return {
    hash: route.hash,
    name: route.name,
    query,
  };
};
</script>

<template>
  <nav
    v-show="showPagination"
    aria-hidden="false"
    :aria-label="$t('pagination.label')"
    data-qa="pagination navigation"
    class="pagination-nav-input"
  >
    <ul class="ps-0 d-flex justify-content-center align-items-center">
      <li
        :class="{
          disabled: prevDisabled,
          'btn-text': buttonText,
          'me-md-3 me-4k-5': pageInput,
        }"
        class="page-item btn-prev d-flex ps-0 me-2"
        data-qa="prev button"
      >
        <GenericSmartLink
          :id="prevLinkId"
          :destination="prevUrl"
          :aria-label="$t('pagination.previous')"
          :disabled="prevDisabled"
          :aria-hidden="prevDisabled"
          class="page-link"
          data-qa="prev button link"
        >
          <span
            v-if="buttonIconClass"
            :class="[
              buttonIconClass,
              {
                'me-1 me-4k-2': buttonText,
              },
            ]"
            data-qa="prev button icon"
          />
          <template v-if="buttonText">
            {{ $t("pagination.previous") }}
          </template>
        </GenericSmartLink>
      </li>
      <li v-if="pageInput" class="page-item page-input d-flex">
        <input
          v-model="page"
          name="page"
          :aria-label="$t('pagination.pageNumber')"
          :max="totalPages"
          :min="1"
          data-qa="pagination input"
          type="number"
          @blur="handlePageInputChange"
          @change="handlePageInputChange"
        />
        {{ $t("pagination.of") }} {{ totalPages }}
      </li>
      <li
        :class="{
          'btn-text': buttonText,
          disabled: nextDisabled,
          'ms-2 ms-md-3 ms-4k-5': pageInput,
          'me-2': progress,
        }"
        class="page-item btn-next d-flex pe-0"
        data-qa="next button"
      >
        <GenericSmartLink
          :id="nextLinkId"
          :destination="nextUrl"
          :aria-label="$t('pagination.next')"
          :disabled="nextDisabled"
          :aria-hidden="nextDisabled"
          class="page-link"
        >
          <template v-if="buttonText">
            {{ $t("pagination.next") }}
          </template>
          <span
            v-if="buttonIconClass"
            :class="[
              buttonIconClass,
              {
                'ms-1 ms-4k-2': buttonText,
              },
            ]"
            data-qa="next button icon"
          />
        </GenericSmartLink>
      </li>
      <li
        v-if="progress"
        class="pagination-progress d-flex align-items-center"
        data-qa="pagination progress"
      >
        {{ page }}/{{ totalPages }}
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "@europeana/style/scss/pagination";
</style>
