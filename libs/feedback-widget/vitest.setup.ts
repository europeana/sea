import { computed, ref } from "vue";
import { config } from "@vue/test-utils";
import { configProps } from "./src/config";
import {
  configInjectionKey,
  i18nInjectionKey,
} from "./src/utils/injectionKeys";

config.global.provide[configInjectionKey as symbol] = ref({
  apiUrl: configProps.apiUrl.default,
  fallbackLocale: configProps.fallbackLocale.default,
  faqUrl: configProps.faqUrl.default,
  locale: configProps.locale.default,
});

config.global.provide[i18nInjectionKey as symbol] = computed(() => ({
  locale: "en",
  fallbackLocale: "en",
  messages: {},
  t: (tKey: string) => tKey,
}));
