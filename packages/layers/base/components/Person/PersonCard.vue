<script setup>
const { $bs } = useNuxtApp();

const props = defineProps({
  /**
   * Image object
   * Expected props: url, width, height, contentType
   */
  image: {
    type: Object,
    default: null,
  },
  /**
   * Name of the person
   */
  name: {
    type: String,
    default: null,
  },
  /**
   * Role of the person
   */
  role: {
    type: String,
    default: null,
  },
  /**
   * Email address of the person
   */
  email: {
    type: String,
    default: null,
  },
  /**
   * Website url of the person
   */
  website: {
    type: String,
    default: null,
  },
  /**
   * Show or hide person contact buttons
   */
  showContactButtons: {
    type: Boolean,
    default: true,
  },
  /**
   * If `true`, image will be lazy-loaded
   */
  lazy: {
    type: Boolean,
    default: true,
  },
});

const emailRef = useTemplateRef("email");
const linkedinRef = useTemplateRef("linkedin");

onMounted(() => {
  // Initialise Bootstrap Tooltips
  [emailRef.value?.$el, linkedinRef.value?.$el]
    .filter(Boolean)
    .map((triggerElement) => new $bs.Tooltip(triggerElement));
});

const imageError = ref(false);

const imageNotFound = () => {
  imageError.value = true;
};

const contentfulImageCropPresets = {
  small: { w: 120, h: 120, fit: "fill", f: "face", r: 100 },
};

const isLinkedInUrl = (url) => {
  return /^http(s):\/\/www\.linkedin\.com/.test(url);
};
const linkedInProfile = computed(() =>
  isLinkedInUrl(props.website) ? props.website : undefined,
);

const contactDataExists = computed(() => props.email || linkedInProfile.value);
const renderButtons = computed(
  () => props.showContactButtons && contactDataExists.value,
);
</script>

<template>
  <div class="person-card text-center position-relative">
    <ImageOptimised
      v-if="!imageError && image?.url"
      :src="image?.url"
      :width="image?.width"
      :height="image?.height"
      :content-type="image?.contentType"
      :contentful-image-crop-presets="contentfulImageCropPresets"
      :picture-source-media-resolutions="[1, 2]"
      :lazy="lazy"
      class="person-image"
      @error="imageNotFound"
    />
    <span
      v-else
      class="icon-person-placeholder person-fallback-image mx-auto"
    />
    <div
      v-if="renderButtons"
      class="buttons-overlay position-absolute w-100 mx-auto"
    >
      <GenericSmartLink
        v-if="email"
        ref="email"
        data-bs-toggle="tooltip"
        :title="$t('actions.email')"
        data-bs-placement="top"
        class="btn btn-light-flat email-btn"
        :destination="`mailto:${email}`"
        :hide-external-icon="true"
        :aria-label="$t('actions.email')"
      >
        <span
          class="icon-email d-inline-flex align-items-center justify-content-center"
        />
      </GenericSmartLink>
      <GenericSmartLink
        v-if="linkedInProfile"
        ref="linkedin"
        data-bs-toggle="tooltip"
        :title="$t('actions.linkedIn')"
        data-bs-placement="top"
        class="btn btn-light-flat linkedin-btn"
        :destination="linkedInProfile"
        :hide-external-icon="true"
        :aria-label="$t('actions.linkedIn')"
      >
        <span
          class="icon-linkedin-circle d-inline-flex align-items-center justify-content-center"
        />
      </GenericSmartLink>
    </div>
    <p v-if="name" class="person-name mb-1 mb-4k-2">{{ name }}</p>
    <p v-if="role" class="person-role mb-0">{{ role }}</p>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.person-card {
  width: 10.25rem;

  @media (min-width: $bp-extralarge) {
    width: 14.375rem;
  }

  @media (min-width: $bp-4k) {
    width: calc(var(--bp-4k-increment) * 14.375rem);
  }
}

.person-name {
  font-weight: 600;
  font-size: $font-size-base;
  word-wrap: anywhere;

  @media (min-width: $bp-4k) {
    font-size: calc(var(--bp-4k-increment) * $font-size-base);
  }
}

.person-role {
  color: $darkgrey;
  font-size: $font-size-small;
  text-transform: uppercase;

  @media (min-width: $bp-4k) {
    font-size: calc(var(--bp-4k-increment) * $font-size-small);
  }
}

.person-image {
  :deep(img) {
    width: 7.5rem;
    height: 7.5rem;
    margin-bottom: 0.875rem;
    border-radius: 50%;

    @media (min-width: $bp-4k) {
      width: calc(var(--bp-4k-increment) * 7.5rem);
      height: calc(var(--bp-4k-increment) * 7.5rem);
      margin-bottom: calc(var(--bp-4k-increment) * 0.875rem);
    }
  }
}

.buttons-overlay {
  top: 6.5rem;
  left: 0;
  right: 0;

  @media (min-width: $bp-4k) {
    top: calc(var(--bp-4k-increment) * 6.5rem);
  }

  .btn {
    line-height: 1rem;

    @media (min-width: $bp-4k) {
      line-height: calc(var(--bp-4k-increment) * 1rem);
    }

    span {
      background-color: $white;
      line-height: 1rem;

      @media (min-width: $bp-4k) {
        line-height: calc(var(--bp-4k-increment) * 1rem);
      }
    }

    &:hover,
    &:focus {
      span {
        background-color: $black;
        transition: $standard-transition;
      }
    }

    &.email-btn {
      font-size: 1.125rem;
      padding: 0.125rem;

      @media (min-width: $bp-4k) {
        font-size: calc(var(--bp-4k-increment) * 1.125rem);
        padding: calc(var(--bp-4k-increment) * 0.125rem);
      }

      span {
        border-radius: $border-radius-small;
        width: 1.125rem;
        height: 1rem;

        @media (min-width: $bp-4k) {
          border-radius: calc(var(--bp-4k-increment) * $border-radius-small);
          width: calc(var(--bp-4k-increment) * 1.125rem);
          height: calc(var(--bp-4k-increment) * 1rem);
        }
      }
    }

    &.linkedin-btn {
      font-size: 1.25rem;
      padding: 0.0625rem;

      @media (min-width: $bp-4k) {
        font-size: calc(var(--bp-4k-increment) * 1.25rem);
        padding: calc(var(--bp-4k-increment) * 0.0625rem);
      }

      span {
        border-radius: 50%;
        width: 1.25rem;
        height: 1.25rem;

        @media (min-width: $bp-4k) {
          width: calc(var(--bp-4k-increment) * 1.25rem);
          height: calc(var(--bp-4k-increment) * 1.25rem);
        }
      }
    }
  }
}

.person-fallback-image {
  background: $darkgrey-light;
  color: $middlegrey;
  display: block;
  width: 7.5rem;
  height: 7.5rem;
  border-radius: 50%;
  font-size: 5.5rem;
  align-content: center;
  margin-bottom: 0.875rem;

  @media (min-width: $bp-4k) {
    font-size: calc(var(--bp-4k-increment) * 5.5rem);
    width: calc(var(--bp-4k-increment) * 7.5rem);
    height: calc(var(--bp-4k-increment) * 7.5rem);
    margin-bottom: calc(var(--bp-4k-increment) * 0.875rem);
  }
}
</style>
