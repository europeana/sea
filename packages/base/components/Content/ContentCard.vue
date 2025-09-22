<script setup>
// explicit import needed for dynamic components: https://nuxt.com/docs/guide/directory-structure/components#dynamic-components
import { GenericSmartLink } from "#components";
import stripMarkdown from "@/utils/markdown/strip.js";
import truncate from "@/utils/text/truncate.js";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
  /**
   * Card title
   *
   */
  title: {
    type: String,
    required: true,
  },
  /**
   * Card subtitle
   */
  subTitle: {
    type: String,
    default: null,
  },
  /**
   * Card text
   *
   */
  text: {
    type: String,
    default: null,
  },
  /**
   * URL for the card to link to
   *
   * An object should be a Vue route
   */
  url: {
    type: [String, Object],
    default: "",
  },
  /**
   * URL of an image to display
   */
  imageUrl: {
    type: String,
    default: "",
  },
  /**
   * Content type of the image
   */
  imageContentType: {
    type: String,
    default: null,
  },
  /**
   * Width of the image
   */
  imageWidth: {
    type: Number,
    default: 520,
  },
  /**
   * Height of the image
   */
  imageHeight: {
    type: Number,
    default: 338,
  },
  /**
   * Image crop presets for optimised images
   *
   */
  contentfulImageCropPresets: {
    type: Object,
    default: () => ({ small: { w: 520, h: 338, fit: "fill", f: "face" } }),
  },
  /**
   * Image sizes for optimised images
   */
  imageSizes: {
    type: String,
    default: null,
  },
  /**
   * If `true`, image will be lazy-loaded
   */
  lazy: {
    type: Boolean,
    default: true,
  },
});
const imageFound = ref(true);
const displayLabelTypes = "news|project";

const displaySubTitle = computed(() => {
  return props.subTitle || displayLabel.value;
});

const displayLabel = computed(() => {
  if (!displayLabelType.value) {
    return false;
  }

  return t(displayLabelType.value);
});

const displayLabelType = computed(() => displayLabelMatch.value?.[1]);

const displayLabelMatch = computed(() =>
  typeof props.url === "object"
    ? displayLabelMatchObject.value
    : displayLabelMatchString.value,
);

const displayLabelMatchObject = computed(() =>
  props.url.name.match(new RegExp(`(${displayLabelTypes})`)),
);

const displayLabelMatchString = computed(() =>
  props.url?.match(new RegExp(`/(${displayLabelTypes}).?[/.]`)),
);

const cardText = computed(() => {
  const stripped = props.text && stripMarkdown(props.text);
  return truncate(stripped, 255);
});

const imageNotFound = () => {
  imageFound.value = false;
};
</script>

<template>
  <div class="card text-left content-card default-card" data-qa="content card">
    <div class="card-wrapper">
      <div v-if="imageFound && imageUrl" class="card-img">
        <ImageOptimised
          :src="imageUrl"
          :width="imageWidth"
          :height="imageHeight"
          :content-type="imageContentType"
          :contentful-image-crop-presets="contentfulImageCropPresets"
          :image-sizes="imageSizes"
          :picture-source-media-resolutions="[1, 2]"
          :lazy="lazy"
          @error="imageNotFound"
        />
      </div>
      <div class="card-body" data-qa="card body">
        <div v-if="displaySubTitle" class="card-subtitle mt-0">
          {{ displaySubTitle }}
        </div>
        <div class="title-texts-wrapper">
          <div v-if="title" class="card-title" data-qa="card title">
            <component
              :is="url ? GenericSmartLink : 'div'"
              :destination="url"
              class="card-link"
            >
              <span>
                {{ truncate(title, 90) }}
              </span>
            </component>
          </div>
          <template v-if="cardText">
            <div class="card-text">
              <p>{{ cardText }}</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
