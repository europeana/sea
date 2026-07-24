<script setup>
import { defineProps, ref } from "vue";

import FeedbackWidget from "./FeedbackWidget.vue";

import { configProps } from "../config.js";
import { locales } from "../utils/i18n.js";

const props = defineProps(configProps);

const config = ref({
  apiUrl: props.apiUrl,
  fallbackLocale: props.fallbackLocale,
  faqUrl: props.faqUrl,
  locale: props.locale,
});

const form = ref({ ...config.value });

const handleFormSubmit = () => {
  config.value = { ...form.value };
};
</script>

<template>
  <FeedbackWidget
    :api-url="config.apiUrl"
    :fallback-locale="config.fallbackLocale"
    :faq-url="config.faqUrl"
    :locale="config.locale"
  >
    <template #header>
      <h2>Configuration</h2>
      <form class="europeana-feedback-form" @submit.prevent="handleFormSubmit">
        <div class="d-flex flex-wrap">
          <div class="form-fields">
            <div>
              <label for="apiUrl" class="d-block">API URL</label>
              <input id="apiUrl" v-model="form.apiUrl" class="form-control" />
            </div>
            <div>
              <label for="fallbackLocale" class="d-block"
                >Fallback locale</label
              >
              <select
                id="fallbackLocale"
                v-model="form.fallbackLocale"
                class="form-control"
              >
                <option v-for="locale in locales" :key="locale" :value="locale">
                  {{ locale }}
                </option>
              </select>
            </div>
            <div>
              <label for="faqUrl" class="d-block">FAQ URL</label>
              <input id="faqUrl" v-model="form.faqUrl" class="form-control" />
            </div>
            <div>
              <label for="locale" class="d-block">Locale</label>
              <select id="locale" v-model="form.locale" class="form-control">
                <option v-for="locale in locales" :key="locale" :value="locale">
                  {{ locale }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="form-buttons d-flex align-items-end">
          <button class="btn btn-primary mt-3" type="submit">Apply</button>
        </div>
      </form>
    </template>
  </FeedbackWidget>
</template>

<style lang="scss">
@import "@/assets/style";
</style>
