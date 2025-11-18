<script setup>
import { annotateParity } from "@europeana/sea-base-layer/utils/annotateParity.js";
import { deepFindEntriesOfType } from "@europeana/sea-base-layer/utils/contentful/deepFindEntriesOfType.js";

import landingPageQuery from "@/graphql/queries/landingPage.graphql";

const route = useRoute();
const contentful = inject("$contentful");
const { localeProperties } = useI18n();

const { data: contentfulResponse, error: contentfulErrors } =
  await useAsyncData(`landingPage:${route.params.slug}`, () => {
    const variables = {
      identifier: route.params.slug,
      locale: localeProperties.value.language,
    };

    return contentful.query(landingPageQuery, variables);
  });

const page = computed(() => {
  return contentfulResponse.value?.data?.landingPageCollection?.items?.[0];
});

const error = computed(() => {
  if (
    !contentfulErrors.value &&
    !contentfulResponse.value?.data?.landingPageCollection?.items?.[0]
  ) {
    showError({ statusCode: 404, statusMessage: "Not Found" });
  }
  return contentfulErrors.value;
});

const sections = computed(() => {
  let availableSections = page?.value?.hasPartCollection?.items.filter(
    (item) => !!item,
  );
  annotateParity(deepFindEntriesOfType(availableSections, "ImageCard"));
  return availableSections;
});

useHead({
  title: page?.value?.headline,
});
</script>

<template>
  <div>
    <LandingHero
      :headline="page?.headline"
      :text="page?.text"
      :hero-image="page?.primaryImageOfPage"
    />
    <!-- TODO: replace generic alert message with fully illustrated ErrorMessage -->
    <GenericAlertMessage v-if="error" :error="error" class="container" />
    <PageSections v-else :sections="sections" />
  </div>
</template>
