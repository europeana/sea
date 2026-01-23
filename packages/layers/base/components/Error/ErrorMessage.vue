<script setup>
import { camelCase } from "lodash-es";
const { t, te } = useI18n();

const props = defineProps({
  titleTag: {
    type: String,
    default: "h1",
  },
  error: {
    type: Object,
    required: true,
  },
  errorImage: {
    type: Object,
    default: null,
  },
});

const camelCaseMessage = computed(() => camelCase(props.error.message));

const heading = computed(() => {
  if (te(`errorMessage.${props.error.statusCode}`)) {
    return t(`errorMessage.${props.error.statusCode}`);
  } else if (te(`errorMessage.${camelCaseMessage.value}`)) {
    return t(`errorMessage.${camelCaseMessage.value}`);
  } else {
    return t(`errorMessage.unknown`);
  }
});

const description = computed(() => {
  if (te(`errorMessage.${camelCaseMessage.value}Description`)) {
    return t(`errorMessage.${camelCaseMessage.value}Description`);
  } else {
    return null;
  }
});

const unknownError = computed(
  () =>
    props.error.statusCode !== 404 && camelCaseMessage.value !== "noResults",
);

const showAlertMessage = computed(
  () => unknownError.value || !props.errorImage,
);

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
    v-if="errorImage"
    class="error-explanation d-flex align-items-center justify-content-center"
  >
    <ImageWithAttribution
      :src="errorImage.image?.url || null"
      :content-type="errorImage.image?.contentType || null"
      :width="errorImage.image?.width || 'auto'"
      :height="errorImage.image?.height || 'auto'"
      :alt="errorImage.image?.description || ''"
      :attribution="attributionFields(errorImage)"
      :lazy="false"
    />
    <section class="my-auto">
      <component :is="titleTag" class="title">
        {{ heading }}
      </component>
      <p v-if="description" class="description">{{ description }}</p>
    </section>
  </div>
  <GenericAlertMessage v-if="showAlertMessage" :error="error.message" />
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

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

    @media (min-width: $bp-small) {
      padding-left: 2rem;
      width: 48%;
    }
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
    color: $darkgrey;
    font-family: var(--font-family-primary);
    font-size: var(--title-2-font-size);
    font-weight: var(--title-2-font-weight);

    @media (min-width: $bp-large) {
      font-size: var(--title-2-font-size-lg);
    }

    @media (min-width: $bp-4k) {
      font-size: var(--title-2-font-size-4k);
    }
  }

  p.description {
    font-size: $font-size-base;
    color: $darkgrey;

    @media (min-width: $bp-small) {
      font-size: 1.25rem;
    }

    @media (min-width: $bp-4k) {
      font-size: calc(var(--bp-4k-increment) * 1.25rem);
    }
  }
}

figure {
  display: block;
  width: 75%;
  max-width: 400px;
  margin-bottom: 3rem;

  @media (min-width: $bp-small) {
    width: 52%;
    margin-bottom: 0;
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
