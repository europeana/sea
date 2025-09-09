<script setup>
import projectPageQuery from "@/graphql/queries/projectPage.graphql";

const route = useRoute();

const contentful = inject("$contentful");
const { localeProperties, t } = useI18n();

const { data: page } = await useAsyncData(
  `projectPage:${route.params.slug}`,
  async () => {
    const variables = {
      identifier: route.params.slug,
      locale: localeProperties.value.language,
    };

    const response = await contentful.query(projectPageQuery, variables);
    return response.data?.projectCollection?.items?.[0] || {};
  },
);

const partnerList = computed(() => {
  if (!page.value.partnerEntities) {
    return page.value.partners;
  }
  let returnVal = page.partners;
  page.value.partnerEntities.forEach((entity) => {
    returnVal = returnVal.concat(` - ${entity}`);
  });
  return returnVal;
});

const impactMetrics = computed(() => {
  return page.value.impactMetrics.map((metric) => {
    const parts = metric.split(":");
    return { label: parts[0], value: parts[1] };
  });
});

const reports = computed(() => {
  return page.value.reportsCollection.items.map((report) => {
    return { label: report.title, icon: "download", url: report.url };
  });
});

const fundingInfo = computed(() => {
  return [
    {
      label: t("projects.fundingStream"),
      value: page.value.fundingStream.text,
      url: page.value.fundingStream.url,
    },
    { label: t("projects.contact"), value: page.value.contactNumber },
  ];
});

useHead({
  title: page.value.name,
});
</script>

<template>
  <div class="page text-page mb-5">
    <AuthoredHead
      :title="page.name"
      :hero="page.primaryImageOfPage"
      :context-label="$t('project')"
    />
    <div class="container footer-margin pb-4k-5">
      <div class="row justify-content-center">
        <div class="col col-12 col-lg-8">
          <article>
            <p>
              {{ page.headline }}
            </p>
            <div class="dates fw-bold d-block">
              <time class="d-inline-block" data-qa="date">
                {{
                  $t("projects.dates", {
                    startDate: $d(
                      new Date(page.startDate),
                      "month",
                      localeProperties.language,
                    ),
                    endDate: $d(
                      new Date(page.endDate),
                      "month",
                      localeProperties.language,
                    ),
                  })
                }}
              </time>
            </div>
            <div
              class="mt-3 mt-md-4 mb-4 pb-2 pt-md-2 py-4k-5 d-flex align-items-center"
            >
              <ShareButton class="mr-4" />
              <ShareSocialModal
                :share-to="['linkedin', 'bluesky', 'facebook']"
              />
            </div>
            <div class="authored-section mb-5">
              <ContentRichText
                :text="page.description"
                class="mb-4 mb-md-5 pb-4k-5"
              />
              <h2>
                {{ $t("projects.goals") }}
              </h2>
              <ContentRichText
                :text="page.goals"
                class="mb-4 mb-md-5 pb-4k-5"
              />
              <!-- add new quote component here -->
              <h2>
                {{ $t("projects.partners") }}
              </h2>
              <ContentRichText
                :text="partnerList"
                class="mb-4 mb-md-5 pb-4k-5"
              />
              <h2>
                {{ $t("projects.funding") }}
              </h2>
              <GenericInfoTable :table-data="fundingInfo" />
              <GenericSmartLink :destination="page.fundingLogoUrl">
                <img :src="page.fundingLogo.url" class="funding-logo" />
              </GenericSmartLink>
              <h2>
                {{ $t("projects.impact") }}
              </h2>
              <GenericInfoTable :table-data="impactMetrics" />
              <h2>
                {{ $t("projects.reports") }}
              </h2>
              <GenericInfoTable :table-data="reports" />
              <template v-if="page.factSheet">
                <h2>
                  {{ $t("projects.factSheet") }}
                </h2>
                <button>{{ $t("projects.viewFactSheet") }}</button>
                <button>{{ $t("projects.downloadFactSheet") }}</button>
              </template>
            </div>
          </article>
          <RelatedCategoryTags
            v-if="page.tags"
            :tags="page.tags"
            class="related-container"
            route-name="data-space"
            badge-variant="badge-secondary"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "assets/scss/variables";

.text-page {
  margin-top: $page-header-height; // leave space for the fixed positioned header

  @media (min-width: $bp-4k) {
    margin-top: $page-header-height-4k;
  }
}

h2 {
  align-content: left;
}

.dates {
  font-size: $font-size-base;

  @media (min-width: $bp-4k) {
    font-size: $font-size-32;
  }
}

.xxl-page :deep(.icon-ic-tag) {
  @media (min-width: $bp-4k) {
    line-height: 4rem;
    font-size: 3rem;
  }
}
</style>
