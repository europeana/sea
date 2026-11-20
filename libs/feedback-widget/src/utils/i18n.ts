import * as messages from "../locales/index";

export type LocaleCode = keyof typeof messages;
export type LocaleMessages = Record<string, Record<string, unknown>>;

export interface I18nInstance {
  locale: string;
  fallbackLocale: string;
  messages: LocaleMessages;
  t(key: string, locale?: string): string;
}

export interface CreateI18nOptions {
  locale?: string;
  fallbackLocale?: string;
  messages?: LocaleMessages;
}

export const locales = Object.keys(messages) as LocaleCode[];

export const createI18n = (options: CreateI18nOptions = {}): I18nInstance => {
  return {
    locale: "en",
    fallbackLocale: "en",
    messages: {},
    ...options,
    t(this: I18nInstance, key: string, locale: string = this.locale): string {
      const textForLocale = key.split(".").reduce<unknown>((memo, keyPart) => {
        if (memo && typeof memo === "object" && keyPart in memo) {
          return (memo as Record<string, unknown>)[keyPart];
        }
        return undefined;
      }, this.messages[locale]);

      if (typeof textForLocale === "string" || locale === this.fallbackLocale) {
        return (textForLocale as string) ?? "";
      } else {
        return this.t(key, this.fallbackLocale);
      }
    },
  };
};
