<script setup>
const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

// TODO:
// handle url param removal for language switch
const availableLocales = computed(() => {
  return locales.value.filter((l) => {
    return l.code !== locale.value;
  });
});
const selectedLocale = computed(() => {
  return locales.value.find((l) => {
    return l.code === locale.value;
  }).name;
});
</script>

<template>
  <div class="dropdown" variant="light">
    <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown">
      <span class="icon-language me-2" />
      {{ selectedLocale }}
    </button>
    <ul class="dropdown-menu">
      <li v-for="l in availableLocales" :key="l.code">
        <NuxtLink class="dropdown-item" :to="switchLocalePath(l.code)">
          {{ l.name }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
@import "@europeana/style/scss/variables";

.dropdown-toggle {
  background-color: $white;
  border-color: $white;
  border-radius: $border-radius-small;
  color: $blue;
  padding: 0.6rem 0.75rem;

  @media (min-width: $bp-4k) {
    border-radius: $border-radius-small-4k;
    font-size: 2rem;
    padding: 1.2rem 1.5rem;
  }

  &:after {
    margin-left: 0.75rem;

    @media (min-width: $bp-4k) {
      margin-left: 1.5rem;
    }
  }

  &:first-child:active {
    background-color: $white;
    border-color: $white;
    color: $blue;
  }

  .icon-language {
    font-size: 1.5rem;

    @media (min-width: $bp-4k) {
      font-size: 3rem;
    }
  }
}

.dropdown-menu {
  max-height: 50vh;
  overflow: auto;
}
</style>
