<script setup>
const { t } = useI18n();

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});
const fundingInfo = [
  {
    label: t("projects.fundingStream"),
    value: props.project.fundingStream?.text,
    url: props.project.fundingStream?.url,
  },
  { label: t("projects.contract"), value: props.project.contractNumber },
];

const FUNDING_LOGO_SRCSET_PRESETS = {
  "4k": { w: 160, h: 32 },
  "4k+": { w: 320, h: 64 },
};

const fundingLogoImageSizes = [
  "(max-width: 3019px) 32px", // bp-4k
  "64px",
].join(",");
</script>
<template>
  <GenericInfoTable :table-data="fundingInfo">
    <tr class="funders-row">
      <td class="pb-2">{{ $t("projects.funders") }}</td>
      <td class="py-0 pt-sm-2"></td>
    </tr>
    <tr>
      <td class="py-0 border-0">
        <GenericSmartLink
          v-for="fundingLogo in project?.fundingLogosCollection.items"
          :key="fundingLogo.url"
          :destination="fundingLogo.url"
          hide-external-icon
          class="me-2"
        >
          <ImageOptimised
            class="funding-logo me-2 mb-2"
            :src="fundingLogo.image?.url"
            :content-type="fundingLogo.image?.contentType"
            :contentful-image-crop-presets="FUNDING_LOGO_SRCSET_PRESETS"
            :image-sizes="fundingLogoImageSizes"
            :width="fundingLogo.image?.width"
            :height="fundingLogo.image?.height"
            :max-width="320"
            :alt="fundingLogo.image?.description || ''"
          />
        </GenericSmartLink>
      </td>
    </tr>
  </GenericInfoTable>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

// When SVG img is not nested
:deep(img.funding-logo),
.funding-logo :deep(img) {
  height: 2rem;
  max-width: 10rem;
  width: auto;
  object-fit: contain;

  @media (min-width: $bp-4k) {
    height: 4rem;
    max-width: 20rem;
  }
}
</style>
