<script setup>
import { filesize } from "filesize";
const { d, t, te } = useI18n();

const model = defineModel({
  type: String,
  default: null,
});

const props = defineProps({
  url: {
    type: String,
    default: null,
  },
  idSuffix: {
    type: String,
    default: "",
  },
  select: {
    type: Boolean,
    default: false,
  },
});

const opened = ref([]);

const handleClickAccordionButton = (item) => {
  opened.value.push(item.url);
};

const isOpen = (item) => opened.value.includes(item.url);

watchEffect(() => {
  // if the model value indicates a pre-selected file/directory, open up
  // any parent directories to show the pre-selected in context
  if (
    model.value?.startsWith(props.url) &&
    model.value.length > props.url.length
  ) {
    const pathname = model.value.replace(props.url, "");
    const paths = pathname.split("/").filter(Boolean);
    if (paths.length > 1) {
      const dirUrl = `${props.url}${paths.shift()}/`;
      opened.value.push(dirUrl);
    }
  }
});

const itemURL = (item) => {
  const url = new URL(props.url);
  url.pathname = `${url.pathname}/${item.name}`;
  if (item.type === "directory") {
    url.pathname = `${url.pathname}/`;
  }
  url.pathname = url.pathname.replaceAll("//", "/");
  return url.toString();
};

const singleFileName = computed(() => {
  if (!props.url || props.url.endsWith("/")) {
    return null;
  } else {
    return props.url.split("/").pop();
  }
});

const dirUrl = computed(() => {
  if (!props.url) {
    return null;
  } else if (props.url.endsWith("/")) {
    return props.url;
  } else {
    return props.url.split("/").slice(0, -1).join("/") + "/";
  }
});

const { data, error } = useAsyncData(
  computed(() => `DocumentBrowser:${dirUrl.value}`),
  () => $fetch(dirUrl.value),
);

const fileInfo = (item) => {
  if (item.type === "file") {
    const dateString = te("added")
      ? t("added", { date: d(new Date(item.mtime), "numeric") })
      : new Date(item.mtime).toLocaleString();
    const sizeString = `${filesize(item.size || 0)}`;
    return `${sizeString} • ${dateString}`;
  } else {
    return undefined;
  }
};

const itemDisplay = (item) => ({
  fileInfo: fileInfo(item),
  id: `${props.idSuffix}-${item.name.replaceAll(" ", "")}`,
  name: item.name,
  type: item.type,
  url: itemURL(item),
});

const items = computed(() =>
  [data.value]
    .flat()
    .filter(Boolean)
    .filter(
      (item) => !singleFileName.value || item.name === singleFileName.value,
    )
    .map(itemDisplay),
);
</script>

<template>
  <div v-if="error" class="error-message fst-italic p-3 p-4k-4">
    {{
      $te("documentBrowser.empty") ? $t("documentBrowser.empty") : "Not Found"
    }}
  </div>
  <div
    v-else
    :id="`document-browser${idSuffix}`"
    class="accordion accordion-flush"
  >
    <div
      v-for="item in items"
      :key="item.url"
      class="accordion-item mx-md-3 mx-4k-4"
    >
      <template v-if="item.type === 'directory'">
        <div
          class="accordion-header py-3 my-4k-3 px-2 ps-md-1 ps-4k-2"
          :class="{ 'd-flex align-items-start': select }"
        >
          <input
            v-if="select"
            v-model="model"
            class="form-check-input mt-1 me-2 me-4k-3"
            type="radio"
            :value="item.url"
            :aria-labelledby="`label${item.id}`"
          />
          <button
            :id="select ? `label${item.id}` : undefined"
            class="accordion-button collapsed align-items-start p-0"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="`#collapse${item.id}`"
            aria-expanded="false"
            :aria-controls="`collapse${item.id}`"
            @click="handleClickAccordionButton(item)"
          >
            <span class="icon-chevron me-2 me-4k-3" />
            <span class="icon-folder me-2 me-4k-3" />
            {{ item.name }}
          </button>
        </div>
        <!-- FIXME: collapse class should always be set -->
        <div
          :id="`collapse${item.id}`"
          class="accordion-collapse"
          :class="{ collapse: !isOpen(item) }"
        >
          <div class="accordion-body">
            <DocumentBrowser
              v-if="isOpen(item)"
              v-model="model"
              :id-suffix="`${item.id}`"
              :url="item.url"
              :select="select"
            />
          </div>
        </div>
      </template>
      <div
        v-else-if="item.type === 'file'"
        class="file-link py-3 my-4k-3 px-2 ps-md-1 ps-4k-2"
        :class="{ 'd-flex align-items-start': select }"
      >
        <input
          v-if="select"
          v-model="model"
          class="form-check-input mt-1 me-2 me-4k-3"
          type="radio"
          :value="item.url"
          :aria-labelledby="`label${item.id}`"
        />
        <div :class="{ 'flex-grow-1': select }">
          <GenericSmartLink
            :destination="item.url"
            target="_blank"
            class="text-decoration-none d-flex"
            hide-external-icon
          >
            <span class="icon-file align-self-start me-2 me-4k-3" />
            <span
              :id="select ? `label${item.id}` : undefined"
              class="link-text me-2 me-4k-3"
              >{{ item.name }}</span
            >
            <span class="icon-download-circle ms-auto" />
          </GenericSmartLink>
          <div class="file-info ms-4 ms-4k-5">{{ item.fileInfo }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "@europeana/style/scss/icon-font";

.accordion {
  --bs-accordion-active-bg: transparent;
  --bs-accordion-active-color: #{$black};
  --bs-accordion-btn-focus-box-shadow: none;
  --bs-border-color: #{$lightgrey};
  border-top: 1px solid $lightbluemagenta;
  font-size: $font-size-small;

  @media (min-width: $bp-small) {
    border-top-width: 2px;
  }

  @media (min-width: $bp-4k) {
    font-size: calc(var(--bp-4k-increment) * $font-size-small);
    border-top-width: calc(var(--bp-4k-increment) * 2px);
  }

  // Remove top border from nested accordions
  .accordion {
    border-top: none;
  }
}

.accordion-button {
  font-weight: 600;
  font-size: $font-size-small;
  word-wrap: anywhere;

  @media (min-width: $bp-4k) {
    font-size: calc(var(--bp-4k-increment) * $font-size-small);
  }

  &:not(.collapsed) {
    font-weight: 700;
    box-shadow: none;
  }

  .icon-chevron {
    font-size: 0.425rem;
    line-height: 3;
    transition: var(--bs-accordion-btn-icon-transition);
    color: $darkgrey-light;

    @media (min-width: $bp-4k) {
      font-size: calc(var(--bp-4k-increment) * 0.425rem);
    }
  }

  .icon-folder {
    font-size: 1.125rem;
    color: $darkgrey-light;
    line-height: 1.125;

    @media (min-width: $bp-4k) {
      font-size: calc(var(--bp-4k-increment) * 1.125rem);
    }
  }

  &:not(.collapsed) .icon-chevron {
    transform: var(--bs-accordion-btn-icon-transform);
  }

  // Remove bs chevron element
  &:after {
    content: none;
  }
}

.accordion-item {
  border: none;
  border-bottom: 1px solid var(--bs-border-color);

  @media (min-width: $bp-4k) {
    border-bottom-width: calc(var(--bp-4k-increment) * 1px);
  }

  // Add margin-left only to nested accordions
  .accordion-item {
    margin-left: 0.75rem;

    @media (min-width: $bp-4k) {
      margin-left: calc(var(--bp-4k-increment) * 0.75rem);
    }
  }
}

.accordion-body {
  padding: 0;
  margin: 0 0 0.75rem 2rem;
  border-left: 1px solid var(--bs-border-color);

  @media (min-width: $bp-4k) {
    margin-right: calc(var(--bp-4k-increment) * 0.75rem);
    margin-bottom: calc(var(--bp-4k-increment) * 2rem);
    border-left-width: calc(var(--bp-4k-increment) * 1px);
  }
}

.file-link {
  .link-text {
    text-decoration: none;
    word-wrap: anywhere;
  }

  a:hover .link-text {
    text-decoration: underline;
  }

  .file-info {
    color: $darkgrey-light;
    font-size: $font-size-extrasmall;

    @media (min-width: $bp-4k) {
      font-size: calc(var(--bp-4k-increment) * $font-size-extrasmall);
    }
  }

  .icon-file {
    font-size: $font-size-base;
    color: $darkgrey-light;
    line-height: 1.5;

    @media (min-width: $bp-4k) {
      font-size: calc(var(--bp-4k-increment) * $font-size-base);
    }
  }

  .icon-download-circle {
    font-size: 1.5rem;

    @media (min-width: $bp-4k) {
      font-size: calc(var(--bp-4k-increment) * 1.5rem);
    }
  }
}

.error-message {
  color: $darkgrey-light;
}
</style>
