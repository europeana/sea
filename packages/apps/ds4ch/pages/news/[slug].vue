<script setup>
import blogPostPageQuery from "@/graphql/queries/blogPostPage.graphql";
import truncate from "@europeana/sea-base-layer/utils/text/truncate.js";
import { useAsyncPageData } from "@europeana/sea-base-layer/composables/useAsyncPageData";

const route = useRoute();

const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const { page } = await useAsyncPageData(
  `blogPostPage:${route.params.slug}`,
  async () => {
    const variables = {
      identifier: route.params.slug,
      locale: localeProperties.value.language,
    };

    const response = await contentful.query(blogPostPageQuery, variables);
    return { page: response.data?.blogPostingCollection?.items?.[0] };
  },
);

const sections = page.value.hasPartCollection?.items.filter((item) => !!item);

const authors =
  page.value.authorCollection?.items.length > 0
    ? page.value.authorCollection.items
    : null;

const tags =
  page.value.categoriesCollection?.items.length > 0
    ? page.value.categoriesCollection.items
    : null;

useHead({
  title: page.value.name,
});

const truncatedAttachmentLabel = (attachment) => {
  const extension = attachment.url.split(".").pop();
  return `${truncate(attachment.title, 20)} (${extension.toUpperCase()})`;
};
</script>

<template>
  <div class="page text-page mb-5">
    <AuthoredHead
      :title="page.name"
      :description="page.introduction"
      :hero="page.primaryImageOfPage"
      :cover-hero-image="false"
      :context-label="$t('news')"
    />
    <div class="container footer-margin pb-4k-5">
      <div class="row justify-content-center">
        <div class="col col-12 col-lg-8">
          <article>
            <!-- TODO: create separate component for 'published ... by ...' -->
            <div class="published fw-bold d-block">
              <time
                v-if="page.datePublished"
                class="d-inline-block"
                data-qa="date"
                :datetime="page.datePublished"
              >
                {{
                  $t("authored.publishedDate", {
                    date: $d(
                      new Date(page.datePublished),
                      "short",
                      localeProperties.locale,
                    ),
                  })
                }}
              </time>
              <span v-if="authors">
                {{ ` ${$t("authored.by")} ` }}
              </span>
              <template v-for="(author, index) in authors" :key="index">
                <BlogAuthor
                  class="author d-inline"
                  :name="author.name"
                  :organisation="author.affiliation"
                  :url="author.url"
                />
              </template>
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
              <ContentSection
                v-for="(section, index) in sections"
                :key="index"
                :section="section"
                data-qa="blog-sections"
              />
            </div>
            <!-- TODO: create separate component -->
            <div
              class="d-inline-flex flex-column mw-100"
              data-qa="associated media"
            >
              <NuxtLink
                v-for="(attachment, index) in page.associatedMediaCollection
                  ?.items"
                :key="index"
                class="btn btn-secondary text-transform-none mb-3"
                target="_blank"
                :download="true"
                :to="attachment.url"
                :aria-label="
                  $t('actions.downloadFile', { file: attachment.title })
                "
                :title="attachment.title"
              >
                <span class="icon-ic-download text-white me-2"></span>
                {{ truncatedAttachmentLabel(attachment) }}
              </NuxtLink>
            </div>
          </article>
          <ContentTagsList
            v-if="tags"
            :tags="tags"
            :heading="$t('content.discoverRelated')"
            class="related-container"
            route-name-override="data-space"
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

.published {
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
