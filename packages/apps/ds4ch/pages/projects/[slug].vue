<script setup>
import projectPageQuery from "@/graphql/queries/projectPage.graphql";

const route = useRoute();

const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const { data: page } = await useAsyncData(
  `projectPage:${route.params.slug}`,
  async () => {
    const variables = {
      identifier: route.params.slug,
      locale: localeProperties.value.language,
    };

    const response = await contentful.query(projectPageQuery, variables);
    return response.data?.projectPageCollection?.items?.[0] || {};
  },
);

const partnerList = page.value.project?.partners;
// TODO: It was intened to allow editors to add Europeana organisation entities
// as partnerEntities via contentful. These would need to be retrieved via the
// Europeana entity API to have their prefLabels added as list items here.
//   if (!page.value.project.partnerEntities) {
//     return page.value.partners;
//   }
//   const formattedEntities  = page.value.partnerEntities.join('\n - ')
//   return `${page.value.partners}\n- ${formattedEntities}`;

const impactMetrics = page.value.project?.impactMetrics.map((metric) => {
  const parts = metric.split(":");
  return { label: parts[0], value: parts[1] };
});

const reports = page.value.project?.reportsCollection?.items.map((report) => {
  return { label: report.title, icon: "ic-download", url: report.url };
});

const tags =
  page.value.categoriesCollection?.items.length > 0
    ? page.value.categoriesCollection.items
    : null;

const projectLogoImage = page.value.project?.logo?.image;

const PROJECT_LOGO_SRCSET_PRESETS = {
  "4k": { w: 72, h: 24 },
  "4k+": { w: 144, h: 48 },
};

const projectLogoImageSizes = [
  "(max-width: 3019px) 24px", // bp-4k
  "48px",
].join(",");

useHead({
  title: page.value.name,
  meta: [
    {
      hid: "og:type",
      property: "og:type",
      content: "article",
    },
    {
      hid: "og:image",
      property: "og:image",
      content: page.value.image?.url,
    },
    {
      hid: "og:description",
      property: "og:description",
      content: page.value.headline,
    },
  ],
});
</script>

<template>
  <div class="page text-page mb-5">
    <AuthoredHead
      class="authored-head"
      :title="page.name"
      :hero="page.primaryImageOfPage"
      :context-label="$t('project')"
      :description="page.headline"
    >
      <ImageOptimised
        v-if="projectLogoImage"
        class="project-logo me-2 mb-2"
        :src="projectLogoImage?.url"
        :content-type="projectLogoImage?.contentType"
        :contentful-image-crop-presets="PROJECT_LOGO_SRCSET_PRESETS"
        :image-sizes="projectLogoImageSizes"
        :width="projectLogoImage?.width"
        :height="projectLogoImage?.height"
        :max-width="144"
        :alt="projectLogoImage?.description || ''"
      />
    </AuthoredHead>
    <div class="container footer-margin pb-4k-5">
      <div class="row justify-content-center">
        <div class="col col-12 col-lg-8">
          <article>
            <div class="dates fw-bold d-block">
              <time class="d-inline-block" data-qa="date">
                {{
                  $t("projects.dates", {
                    startDate: $d(
                      new Date(page.project?.startDate),
                      "month",
                      localeProperties.locale,
                    ),
                    endDate: $d(
                      new Date(page.project?.endDate),
                      "month",
                      localeProperties.locale,
                    ),
                  })
                }}
              </time>
            </div>
            <div
              class="mt-3 mt-md-4 mb-4 mb-lg-5 pb-2 pb-lg-0 pt-md-2 py-4k-5 d-flex align-items-center"
            >
              <ShareButton class="mr-4" />
              <ShareSocialModal
                :share-to="['linkedin', 'bluesky', 'facebook']"
              />
            </div>
            <div class="authored-section mb-5">
              <div class="row" tag="section">
                <div class="col col-12 col-lg-9">
                  <ContentRichText
                    :text="page.description"
                    class="mb-3 pb-3 mb-4k-5"
                  />
                  <h2>
                    {{ $t("projects.goals") }}
                  </h2>
                  <ContentRichText
                    :text="page.project?.goals"
                    class="mb-4 mb-md-5 pb-4k-5"
                  />
                  <CardTestimonialCard
                    v-if="page.project.testimonial"
                    :testimonial-text="page.project.testimonial.text"
                    :attribution="page.project.testimonial.attribution"
                    variant="banner"
                  />
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
                  <ProjectFundingInfoTable
                    class="mb-5 pb-4k-5"
                    :project="page.project"
                  />
                  <h2>
                    {{ $t("projects.impact") }}
                  </h2>
                  <GenericInfoTable
                    class="mb-5 pb-4k-5"
                    :table-data="impactMetrics"
                  />
                  <h2>
                    {{ $t("projects.reports") }}
                  </h2>
                  <GenericInfoTable
                    class="mb-5 pb-4k-5"
                    :table-data="reports"
                  />
                  <template v-if="page.project?.factSheet">
                    <h2 class="mb-3 pb-4k-3">
                      {{ $t("projects.factSheet") }}
                    </h2>
                    <a
                      :href="page.project?.factSheet.url"
                      class="btn btn-secondary me-4 me-4k-5 mb-4 mb-sm-3 mb-4k-4"
                    >
                      <span class="icon-text-bold me-2" />
                      {{ $t("projects.viewFactSheet") }}
                    </a>
                    <a
                      :href="page.project?.factSheet.url"
                      :download="page.project?.factSheet.title"
                      class="btn btn-secondary mb-4 mb-sm-3 mb-4k-4"
                    >
                      <span class="icon-ic-download me-2" />
                      {{ $t("projects.downloadFactSheet") }}
                    </a>
                  </template>
                </div>
              </div>
            </div>
          </article>
          <RelatedCategoryTags
            v-if="tags"
            :tags="tags"
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

.authored-head {
  :deep(.title) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    .context-label {
      flex-basis: 100%;
    }
  }

  // When SVG img is not nested
  :deep(img.project-logo),
  .project-logo :deep(img) {
    height: 1.5rem;
    max-width: 4.5rem;
    width: auto;
    object-fit: contain;

    @media (min-width: $bp-4k) {
      height: 3rem;
      max-width: 9rem;
    }
  }
}
</style>
