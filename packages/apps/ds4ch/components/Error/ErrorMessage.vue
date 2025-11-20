<script setup>
import errorImage from "@/utils/errorMessageImage.json";
const { t, te } = useI18n();

const props = defineProps({
  error: {
    type: Object,
    required: true,
  },
});

const title = computed(() => {
  return te(`errorMessage.${props.error.statusCode}`)
    ? t(`errorMessage.${props.error.statusCode}`)
    : t(`errorMessage.unknown`);
});

const showAlertMessage = computed(() => props.error.statusCode !== 404);

const attributionFields = (fields) => {
  return {
    name: fields?.name,
    creator: fields?.creator,
    provider: fields?.provider,
    rightsStatement: fields?.license,
    url: fields?.url,
  };
};
</script>

<template>
  <div
    class="error-explanation d-flex align-items-center justify-content-center"
  >
    <ImageWithAttribution
      :src="errorImage.image?.url || null"
      :content-type="errorImage.image?.contentType || null"
      :width="errorImage.image?.width || 'auto'"
      :height="errorImage.image?.height || 'auto'"
      :alt="errorImage.image?.description || ''"
      :attribution="attributionFields(errorImage)"
    />
    <section class="my-auto">
      <h1 class="title mb-4">
        {{ title }}
      </h1>
    </section>
  </div>
  <GenericAlertMessage v-if="showAlertMessage" :error="error.message" />
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "assets/scss/variables";

.error-explanation {
  padding-top: 3.125rem;
  padding-bottom: 3.125rem;

  @media (min-width: $bp-large) {
    padding-top: 5rem;
    padding-bottom: 5rem;
  }

  @media (orientation: portrait) {
    flex-wrap: wrap;
  }

  @media (orientation: landscape) {
    flex-wrap: nowrap;
  }
}

section {
  @media (orientation: portrait) {
    text-align: center;
  }

  @media (orientation: landscape) {
    height: auto;
    width: 42%;
    margin-left: 4rem;

    @media (min-width: $bp-large) {
      margin-left: 7rem;
    }

    @media (min-width: $bp-4k) {
      margin-left: 10rem;
    }
  }

  .title {
    @extend %title-2;
    color: $darkgrey;
  }
}

figure {
  display: block;
  width: 75%;
  max-width: 400px;
  margin-bottom: 3rem;

  @media (min-width: $bp-small) {
    width: 52%;
  }

  @media (min-width: $bp-4k) {
    max-width: 800px;
  }

  :deep(img) {
    display: block;
    margin: 0 auto;
  }
}
</style>
