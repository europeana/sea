import { config } from "@vue/test-utils";
import { defaults } from "./src/config.js";

config.global.provide.config = defaults;
config.global.provide.i18n = {
  t: (tKey) => tKey,
  locale: { value: "en" },
};
