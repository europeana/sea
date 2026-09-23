<script setup>
import { filesize } from "filesize";
const { d, t } = useI18n();

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
      dateAdded: t("added", { date: d(new Date(item.mtime), "numeric") }),
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
      <input
        v-if="select"
        v-model="model"
        class="form-check-input"
        type="radio"
        :value="item.url"
      />
      <template v-if="item.type === 'directory'">
        <div class="accordion-header">
          <button
            class="accordion-button collapsed"
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
          class="accordion-collapse collapse show"
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
      <div v-else-if="item.type === 'file'" class="file-link p-3">
        <GenericSmartLink
          :destination="item.url"
          target="_blank"
          class="text-decoration-none d-flex align-items-center"
          hide-external-icon
        >
          <span class="icon-file me-2" />
          <span class="link-text">{{ item.text }}</span>
          <span
            class="icon-ic-download d-flex align-items-center justify-content-center ms-auto"
          />
        </GenericSmartLink>
        <div class="date-added ms-3">{{ item.dateAdded }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "assets/scss/variables";
@import "@europeana/style/scss/icon-font";

.accordion {
  --bs-accordion-active-bg: transparent;
  --bs-accordion-active-color: $black;
  --bs-accordion-btn-focus-box-shadow: none;
  border-top: 1px solid $black;

  .accordion {
    border-top: none;
  }
}

.accordion-button {
  border-bottom: 1px solid $black;

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
  font-size: $font-size-18;

  @media (min-width: $bp-4k) {
    height: 3rem;
    width: 3rem;
    font-size: $font-size-36;
  }
}
</style>
