import "../assets/scss/main.scss";

import { sb } from "storybook/test";
import type { Preview } from "@nuxtjs/storybook";
import { watch } from "vue";
import i18nLocales from "../i18n/locales";

import { mswLoader } from "msw-storybook-addon/csf3";

sb.mock(import("@europeana/vue-contentful-graphql/query"));

const defaultLocale = "en";

const preview: Preview = {
  globalTypes: {
    locale: {
      name: "Locale",
      description: "Select a language",
      defaultValue: defaultLocale,
      toolbar: {
        icon: "globe",
        items: i18nLocales.map((locale) => ({
          value: locale.code,
          title: locale.name,
        })),
      },
    },
  },
  initialGlobals: {
    locale: defaultLocale,
  },
  decorators: [
    (story, context) => {
      return {
        components: { story },
        template: "<story />",
        setup() {
          const i18n = useI18n();
          watch(
            () => context.globals.locale,
            function (newLocale) {
              return i18n.setLocale(newLocale);
            },
            { immediate: true },
          );
        },
      };
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ["autodocs"],
  /*
   * Register the MSW loader for all stories
   * See https://github.com/mswjs/msw-storybook-addon#csf-30
   * to learn how to customize it
   */
  loaders: [mswLoader()],
};

export default preview;
