import type { ComputedRef, InjectionKey, Ref } from "vue";
import type { FeedbackWidgetConfig } from "../config.ts";
import type { I18nInstance } from "./i18n";

export const configInjectionKey: InjectionKey<Ref<FeedbackWidgetConfig>> =
  Symbol("config");
export const i18nInjectionKey: InjectionKey<ComputedRef<I18nInstance>> =
  Symbol("i18n");
