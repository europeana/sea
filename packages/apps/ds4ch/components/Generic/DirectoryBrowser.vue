<script setup>
defineProps({
  directories: {
    type: Array,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
});
</script>

<template>
  <div :id="`directory-browser-${level}`" class="accordion accordion-flush">
    <div
      v-for="(directory, index) in directories"
      :key="directory.name + index"
      class="accordion-item"
    >
      <div class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          :data-bs-target="`#collapse-${index}-${level}`"
          aria-expanded="false"
          :aria-controls="`collapse-${index}-${level}`"
        >
          {{ directory.name }}
        </button>
      </div>
      <div
        :id="`collapse-${index}-${level}`"
        class="accordion-collapse collapse"
        :data-bs-parent="`directory-browser-${level}`"
      >
        <div class="accordion-body">
          <template
            v-for="(item, subIndex) in directory.items"
            :key="item.name + subIndex"
          >
            <DirectoryBrowser
              v-if="item.type === 'directory'"
              :directories="[item]"
              :level="level + 1"
            />
            <!-- TODO: add actual file URL -->
            <GenericSmartLink
              v-if="item.type === 'file'"
              destination="/"
              class="file-link text-decoration-none d-flex align-items-center p-3"
            >
              <span class="icon-file me-2" />
              <span class="link-text">{{ item.name }}</span>
              <span
                class="icon-ic-download d-flex align-items-center justify-content-center ms-auto"
              />
            </GenericSmartLink>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "assets/scss/variables";

.accordion {
  --bs-accordion-active-bg: transparent;
  --bs-accordion-active-color: $black;
  border-top: 1px solid $black;
  border-bottom: 1px solid $black;
}

.accordion-button:not(.collapsed) {
  font-weight: 600;
}

.accordion-body {
  padding: 0 0 0 1rem;
}
.file-link {
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
