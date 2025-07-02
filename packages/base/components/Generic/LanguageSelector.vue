<script setup>
import { computed } from "vue";
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
    <button
      class="btn btn-secondary dropdown-toggle"
      type="button"
      data-bs-toggle="dropdown"
    >
      <span class="icon-language" />
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
