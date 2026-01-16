import { config } from "@vue/test-utils";

config.global.mocks.$t = (key: string) => key;
config.global.stubs["i18n-t"] = true;
