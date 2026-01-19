<script setup>
// explicit import needed for dynamic components: https://nuxt.com/docs/guide/directory-structure/components#dynamic-components
import { GenericSmartLink } from "#components";

const props = defineProps({
  /**
   * Name of the cited resource
   */
  name: {
    type: String,
    default: null,
  },
  /**
   * Creator of the cited resource
   */
  creator: {
    type: String,
    default: null,
  },
  /**
   * Provider of the cited resource
   */
  provider: {
    type: String,
    default: null,
  },
  /**
   * Rights statement URL of the cited resource
   */
  rightsStatement: {
    type: String,
    required: true,
  },
  /**
   * URL of the cited resource
   */
  url: {
    type: String,
    default: null,
  },
  /**
   * If `true`, use the extended format
   */
  extended: {
    type: Boolean,
    default: false,
  },
  /**
   * If `true`, focus the first link when mounted
   */
  setFocus: {
    type: Boolean,
    default: false,
  },
});

const linkText = computed(() =>
  [props.name, props.creator, props.provider].filter(Boolean).join(", "),
);

const cite = useTemplateRef("cite");

onMounted(() => {
  if (props.extended && props.setFocus) {
    cite.value.getElementsByTagName("a")[0]?.focus();
  }
});
</script>
<template>
  <cite v-if="props.extended" ref="cite" class="cite-attribution">
    <p v-if="props.name">
      {{ $t("attribution.title") }}
      <GenericSmartLink v-if="props.url" :destination="props.url">
        {{ props.name }}
      </GenericSmartLink>
      <span v-else> {{ props.name }} </span>
    </p>
    <p v-if="props.creator">
      {{ $t("attribution.creator") }}
      <GenericSmartLink v-if="props.url" :destination="props.url">
        {{ props.creator }}
      </GenericSmartLink>
      <span v-else> {{ props.creator }} </span>
    </p>
    <p v-if="props.provider">
      {{ $t("attribution.institution") }}
      <GenericSmartLink v-if="props.url" :destination="props.url">
        {{ props.provider }}
      </GenericSmartLink>
      <span v-else> {{ props.provider }} </span>
    </p>
    <p>
      <GenericSmartLink
        :destination="props.rightsStatement"
        class="attribution"
      >
        <GenericRightsStatement
          v-if="props.rightsStatement"
          :rights-statement-url="props.rightsStatement"
        />
      </GenericSmartLink>
    </p>
  </cite>
  <cite v-else>
    <component
      :is="props.url ? GenericSmartLink : 'span'"
      :destination="props.url"
      class="attribution"
    >
      {{ linkText }}
      <!-- TODO: shouldn't this have its own link to the rightsStatement? -->
      <GenericRightsStatement
        v-if="props.rightsStatement"
        :rights-statement-url="props.rightsStatement"
      />
    </component>
  </cite>
</template>
<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

// TODO: Remove duplicate styles from @europeana/style/scss/default
cite {
  background: $white;
  border: none;
  border-radius: 0.25rem;
  bottom: 0.5rem;
  box-shadow: $boxshadow-small;
  display: inline;
  font-size: 0.75rem;
  left: initial;
  margin: 0;
  max-width: 75%;
  padding: 0.75rem;
  position: absolute;
  right: 0.5rem;
  text-align: left;

  @at-root .xxl-page & {
    @media (min-width: $bp-4k) {
      border-radius: calc(1.5 * 0.25rem);
      bottom: 0.75rem;
      font-size: calc(1.5 * 0.75rem);
      padding: calc(1.5 * 0.75rem);
      right: 0.75rem;
    }
  }

  &.cite-attribution {
    a {
      text-decoration: none;
    }
  }

  p {
    color: $darkgrey;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.25rem;

    @at-root .xxl-page & {
      @media (min-width: $bp-4k) {
        margin-bottom: calc(1.5 * 0.25rem);
      }
    }
  }

  .icon-external-link {
    line-height: 1.5;
  }

  .attribution {
    margin-top: 0.5rem;

    @at-root .xxl-page & {
      @media (min-width: $bp-4k) {
        margin-top: 0.75rem;
      }
    }

    > span {
      margin-left: 0;

      .license {
        font-size: $font-size-small;
        margin-top: -0.1rem;

        @at-root .xxl-page & {
          @media (min-width: $bp-4k) {
            font-size: $font-size-small-4k;
            margin-top: -0.15rem;
          }
        }
      }
    }
  }
}
</style>
