<script setup>
import { GenericSmartLink } from "#components";
import routeForType from "@/utils/contentRoute.js";

const { t } = useI18n();
const route = useRoute();

const props = defineProps({
  /**
   * Content types to include in the interface.
   * @values "blog post", "project", "event", "training", "exhibition", "story"
   */
  contentTypes: {
    type: Array[String],
    required: true,
  },
});

const availableContentTypes = computed(() =>
  [{ name: t("content.filter.viewAll") }].concat(
    [
      { name: t("content.filter.news"), query: "news", type: "blog post" },
      { name: t("content.filter.events"), query: "event" },
      { name: t("content.filter.training"), query: "training" },
      { name: t("content.filter.projects"), query: "project" },
    ].filter((type) => props.contentTypes.includes(type.type || type.query)),
  ),
);

const typeFromRoute = computed(() => {
  return route.query?.type;
});

const activeType = computed(() => {
  return (
    availableContentTypes.value.find(
      (type) => type.query === typeFromRoute.value,
    ) || availableContentTypes.value[0]
  );
});
const isTypeActive = (type) => {
  return type === activeType.value;
};
</script>

<template>
  <div>
    <nav class="navbar navbar-expand-sm navbar-light">
      <div id="content-filter-navbar" class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto d-none d-lg-flex">
          <li
            v-for="(type, index) in availableContentTypes"
            :key="index"
            class="nav-item"
          >
            <GenericSmartLink
              class="nav-link context-label text-decoration-none p-0 ms-3 ms-4k-4 me-0"
              :class="isTypeActive(type) ? 'active' : ''"
              :aria-current="isTypeActive(type) ? 'page' : ''"
              :destination="routeForType(route, type.query)"
            >
              {{ type.name }}
            </GenericSmartLink>
          </li>
        </ul>
      </div>
      <div class="nav-item dropdown filter-dropdown d-lg-none ms-auto">
        <button
          id="content-filter-navbar-dropdown"
          class="nav-link dropdown-toggle btn-light"
          data-bs-toggle="dropdown"
          data-bs-target=".filter-dropdown"
          aria-expanded="false"
        >
          {{ activeType.name }}
        </button>
        <ul
          class="dropdown-menu"
          aria-labelledby="content-filter-navbar-dropdown"
        >
          <li
            v-for="(type, index) in availableContentTypes"
            :key="index"
            class="nav-item"
          >
            <GenericSmartLink
              class="dropdown-item context-label text-decoration-none"
              :class="isTypeActive(type) ? 'active' : ''"
              :aria-current="isTypeActive(type) ? 'page' : ''"
              :destination="routeForType(route, type.query)"
            >
              <span>
                {{ type.name }}
              </span>
            </GenericSmartLink>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";
@import "@europeana/style/scss/icon-font";
@import "@europeana/style/scss/dropdown";

.navbar {
  background-color: $white;
}

.nav-link {
  font-size: $font-size-small;

  @media (min-width: $bp-4k) {
    font-size: $font-size-small-4k;
  }

  &:hover {
    color: $black;
  }

  &.active {
    font-weight: 700;
    border-bottom: 2px solid $darkgrey;
    color: $darkgrey;

    @media (min-width: $bp-4k) {
      border-bottom-width: 4px;
    }

    a {
      background-color: $white;
    }
  }
}

.dropdown-menu {
  left: auto;
  right: 0;
  border: 0;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.25);
}

.dropdown-toggle {
  font-weight: 600;
  text-transform: uppercase;

  &::after {
    padding-left: 0.5rem;
  }
}

.dropdown .dropdown-item {
  font-weight: 600;

  &:hover {
    background-color: transparent;
    color: $black;
  }

  &:active,
  &.active {
    background-color: $white;

    span {
      font-weight: 700;
      border-bottom: 2px solid $darkgrey;
      color: $darkgrey;
    }
  }
}
</style>
