<script setup>
import { GenericSmartLink } from "#components";

const { t } = useI18n();
const route = useRoute();

const props = defineProps({
  /**
   * Content types to include in the interface.
   * @values "blog post", "exhibition", "project", "story"
   */
  contentTypes: {
    type: Array[String],
    required: true,
  },
});

const availableContentTypes = [{ name: t("content.filter.viewAll") }].concat(
  [
    { name: t("content.filter.news"), query: "news", type: "blog post" },
    { name: t("content.filter.projects"), query: "project" },
    { name: t("content.filter.stories"), query: "story" },
    { name: t("content.filter.exhibitions"), query: "exhibition" },
  ].filter((type) => props.contentTypes.includes(type.type || type.query)),
);

const typeFromRoute = computed(() => {
  return route.query?.type;
});

const activeType = computed(() => {
  return (
    availableContentTypes.find((type) => type.query === typeFromRoute.value) ||
    availableContentTypes[0]
  );
});
const isTypeActive = (type) => {
  return type === activeType.value;
};
const routeForType = (type) => {
  const newQuery = { ...route.query };
  delete newQuery.page;
  if (type.query) {
    newQuery.type = type.query;
  } else {
    delete newQuery.type;
  }
  return { ...route, query: newQuery };
};
</script>

<template>
  <div>
    <nav class="navbar navbar-expand-sm navbar-light">
      <div id="content-filter-navbar" class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 d-none d-sm-flex">
          <li
            v-for="(type, index) in availableContentTypes"
            :key="index"
            class="nav-item"
          >
            <GenericSmartLink
              class="nav-link context-label text-decoration-none p-0 ms-3 ms-4k-4 me-0"
              :class="isTypeActive(type) ? 'active' : ''"
              :aria-current="isTypeActive(type) ? 'page' : ''"
              :destination="routeForType(type)"
            >
              {{ type.name }}
            </GenericSmartLink>
          </li>
        </ul>
      </div>
      <div class="nav-item dropdown filter-dropdown d-sm-none ms-auto">
        <a
          id="content-filter-navbar-dropdown"
          class="nav-link dropdown-toggle btn-light"
          href="#"
          role="button"
          data-bs-toggle="dropdown"
          data-bs-target=".filter-dropdown"
          aria-expanded="false"
        >
          {{ activeType.name }}
        </a>
        <ul
          class="dropdown-menu"
          aria-labelledby="content-filter-navbar-dropdown"
        >
          <li
            v-for="(type, index) in availableContentTypes"
            :key="index"
            class="nav-item d-sm-none"
          >
            <GenericSmartLink
              class="dropdown-item context-label text-decoration-none"
              :class="isTypeActive(type) ? 'active' : ''"
              :aria-current="isTypeActive(type) ? 'page' : ''"
              :destination="routeForType(type)"
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
