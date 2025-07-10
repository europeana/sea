<script setup>
import { onBeforeUnmount } from "vue";

const props = defineProps({
  attribution: {
    type: Object,
    default: null,
  },
});

const keyboardNav = ref(false);
const showCite = ref(false);
const rightsStatement = computed(() => {
  return props.attribution?.rightsStatement || props.attribution?.license;
});
watch(showCite, (newVal) => {
  if (newVal) {
    window.addEventListener("focusin", handleWindowFocusin);
  } else {
    window.removeEventListener("focusin", handleWindowFocusin);
  }
});
onBeforeUnmount(() => {
  window.removeEventListener("focusin", handleWindowFocusin);
});

const toggle = useTemplateRef("toggle");
const attributionToggle = useTemplateRef("attributiontoggle");

const toggleCite = () => {
  showCite.value = !showCite.value;
};
const handleCiteAttributionKeydownEscape = async () => {
  resetKeyboardNav();
  toggleCite();
  await nextTick(() => {
    toggle.value.focus();
  });
};
const handleWindowFocusin = (event) => {
  // focus has changed, toggle the citation if not to a child element
  if (!attributionToggle.value?.contains(event.target)) {
    toggleCite();
    resetKeyboardNav();
  }
};
const resetKeyboardNav = () => {
  keyboardNav.value = false;
};
</script>

<template>
  <figcaption
    ref="attributiontoggle"
    class="background-attribution"
    data-qa="attribution toggle"
    @mouseleave="toggleCite"
  >
    <button
      v-show="!showCite"
      ref="toggle"
      :aria-expanded="showCite ? 'true' : 'false'"
      class="button-icon-only icon-info bg-transparent border-0"
      data-qa="toggle"
      :aria-label="$t('attribution.show')"
      @click="toggleCite"
      @mouseover="toggleCite"
      @touchstart="toggleCite"
      @keydown="keyboardNav = true"
    />
    <ImageCiteAttribution
      v-if="showCite"
      :name="attribution ? attribution.name : null"
      :creator="attribution ? attribution.creator : null"
      :provider="attribution ? attribution.provider : null"
      :rights-statement="rightsStatement"
      :url="attribution ? attribution.url : null"
      :set-focus="keyboardNav"
      extended
      data-qa="attribution"
      @keydown.escape="handleCiteAttributionKeydownEscape"
    />
  </figcaption>
</template>
