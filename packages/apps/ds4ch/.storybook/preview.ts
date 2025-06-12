// import bootstrap css and js
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";

import type { Preview } from "@nuxtjs/storybook";
import { watch } from "vue";

const defaultLocale = "en";

const preview: Preview = {
  globalTypes: {
    locale: {
      name: "Locale",
      description: "Select a language",
      defaultValue: defaultLocale,
      toolbar: {
        icon: "globe",
        items: [
          { value: "en", title: "English" },
          { value: "de", title: "Deutsch" },
        ],
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
};

export default preview;
