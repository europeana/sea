<script setup>
const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
});

const opened = ref([]);

const handleClickAccordionButton = (item) => {
  opened.value.push(item.url);
};

const isOpen = (item) => opened.value.includes(item.url);

const itemURL = (item) => {
  let url = `${props.url}/${item.name}`;
  if (item.type === "directory") {
    url = `${url}/`;
  }
  url = url.replaceAll(/\/\//g, "/");
  return url;
};

const { data } = useAsyncData(`FileBrowser:${props.url}`, () =>
  $fetch(props.url),
);

const items = computed(
  () =>
    data.value?.map((item) => ({
      ...item,
      url: itemURL(item),
    })) || [],
);
</script>

<template>
  <div :id="`file-browser-${level}`" class="accordion accordion-flush">
    <div
      v-for="(item, index) in items"
      :key="item.name + index"
      class="accordion-item"
    >
      <template v-if="item.type === 'directory'">
        <div class="accordion-header">
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="`#collapse-${index}-${level}`"
            aria-expanded="false"
            :aria-controls="`collapse-${index}-${level}`"
            @click="handleClickAccordionButton(item)"
          >
            {{ item.name }}
          </button>
        </div>
        <div
          :id="`collapse-${index}-${level}`"
          class="accordion-collapse collapse"
          :data-bs-parent="`file-browser-${level}`"
        >
          <div class="accordion-body">
            <FileBrowser
              v-if="isOpen(item)"
              :url="item.url"
              :level="level + 1"
            />
          </div>
        </div>
      </template>
      <GenericSmartLink
        v-else-if="item.type === 'file'"
        :destination="item.url"
        class="file-link text-decoration-none d-flex align-items-center p-3"
      >
        <span class="icon-file me-2" />
        <span class="link-text">{{ item.name }}</span>
        <span
          class="icon-ic-download d-flex align-items-center justify-content-center ms-auto"
        />
      </GenericSmartLink>
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
  &:hover .link-text {
    text-decoration: none;
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
