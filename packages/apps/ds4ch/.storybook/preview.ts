import "../assets/scss/main.scss";

import type { Preview } from "@nuxtjs/storybook";
import { watch } from "vue";
import i18nLocales from "../i18n/locales";
import { initialize, mswLoader } from "msw-storybook-addon";

const defaultLocale = "en";

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize();

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
  loaders: [mswLoader],
};

export default preview;
