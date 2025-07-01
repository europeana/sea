import { config } from "@vue/test-utils";

import { createI18n } from "vue-i18n";

config.global.plugins.push(
  createI18n({
    legacy: false,
    locale: "en",
  }),
);

config.global.mocks.$t = (key: string) => key;
config.global.mocks.t = (key: string) => key;
