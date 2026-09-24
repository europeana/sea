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
    required: true,
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

const { data } = useAsyncData(
  computed(() => `FileBrowser:${props.url}`),
  () => $fetch(props.url),
);

const items = computed(
  () =>
    data.value?.map((item) => ({
      dateAdded: te("added")
        ? t("added", { date: d(new Date(item.mtime), "numeric") })
        : new Date(item.mtime).toLocaleString(),
      id: `${props.idSuffix}-${item.name.replaceAll(" ", "")}`,
      text:
        item.type === "file"
          ? `${item.name} (${filesize(item.size || 0)})`
          : item.name,
      type: item.type,
      url: itemURL(item),
    })) || [],
);
</script>

<template>
  <div :id="`file-browser${idSuffix}`" class="accordion accordion-flush">
    <div v-for="item in items" :key="item.url" class="accordion-item">
      <template v-if="item.type === 'directory'">
        <div class="accordion-header p-3" :class="{ 'd-flex': select }">
          <input
            v-if="select"
            v-model="model"
            class="form-check-input me-2"
            type="radio"
            :value="item.url"
            :aria-labelledby="`label${item.id}`"
          />
          <button
            :id="select ? `label${item.id}` : undefined"
            class="accordion-button collapsed p-0"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="`#collapse${item.id}`"
            aria-expanded="false"
            :aria-controls="`collapse${item.id}`"
            @click="handleClickAccordionButton(item)"
          >
            {{ item.text }}
          </button>
        </div>
        <div
          :id="`collapse${item.id}`"
          class="accordion-collapse"
          :class="{ collapse: !isOpen(item) }"
        >
          <div class="accordion-body">
            <FileBrowser
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
        class="file-link p-3"
        :class="{ 'd-flex': select }"
      >
        <input
          v-if="select"
          v-model="model"
          class="form-check-input me-2"
          type="radio"
          :value="item.url"
          :aria-labelledby="`label${item.id}`"
        />
        <div :class="{ 'flex-grow-1': select }">
          <GenericSmartLink
            :destination="item.url"
            target="_blank"
            class="text-decoration-none d-flex align-items-center"
            hide-external-icon
          >
            <span class="icon-file me-2" />
            <span
              :id="select ? `label${item.id}` : undefined"
              class="link-text"
              >{{ item.text }}</span
            >
            <span
              class="icon-ic-download d-flex align-items-center justify-content-center ms-auto"
            />
          </GenericSmartLink>
          <div class="date-added ms-3">{{ item.dateAdded }}</div>
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
  --bs-border-color: #{$darkgrey};
  border-top: 1px solid $black;

  .accordion {
    border-top: none;
  }
}

.accordion-header {
  border-bottom: 1px solid $black;
}

.accordion-button {
  &:not(.collapsed) {
    font-weight: 600;
    box-shadow: none;
  }

  &:after {
    @extend %icon-font;

    content: "\e91b";
    background-image: none;
    font-size: $font-size-smallest;
    line-height: 2;
  }
}

.accordion-item {
  border: none;
}

.accordion-body {
  padding: 0 0 0 1rem;
}

.file-link {
  border-bottom: 1px solid $black;

  .link-text {
    text-decoration: underline;
  }
  a:hover .link-text {
    text-decoration: none;
  }

  .date-added {
    color: $darkgrey;
  }
}

.icon-ic-download {
  height: 1.5rem;
  width: 1.5rem;
  background-color: $black;
  color: $white;
  border-radius: 50%;
  font-size: 1.125rem;

  @media (min-width: $bp-4k) {
    height: 3rem;
    width: 3rem;
    font-size: 2.25rem;
  }
}
</style>
