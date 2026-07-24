<script setup>
import { computed, defineProps, provide, ref, watch, watchEffect } from "vue";

import { createI18n } from "../utils/i18n.js";
import * as messages from "../locales/index.js";
import { configProps } from "../config.js";

import FeedbackButton from "../components/FeedbackButton.vue";
import FeedbackDialog from "../components/FeedbackDialog.vue";

const props = defineProps(configProps);

const config = ref({});

const setConfigFromProps = () => {
  config.value = {
    apiUrl: props.apiUrl,
    fallbackLocale: props.fallbackLocale,
    faqUrl: props.faqUrl,
    locale: props.locale,
  };
};

setConfigFromProps();
watchEffect(setConfigFromProps);

const i18n = computed(() => {
  return createI18n({
    locale: config.value.locale,
    fallbackLocale: config.value.fallbackLocale,
    messages,
  });
});

provide("config", config);
provide("i18n", i18n);

const showDialog = ref(false);
const buttonFocus = ref(false);

watch(showDialog, (newVal) => {
  if (newVal === false) {
    buttonFocus.value = true;
  }
});
</script>

<template>
  <div class="europeana-feedback-container">
    <slot name="header" />
    <div class="europeana-feedback-widget">
      <FeedbackDialog v-if="showDialog" @hide="showDialog = false" />
      <FeedbackButton
        v-else
        :button-focus="buttonFocus"
        @click="showDialog = true"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import "@/assets/style";
</style>
