import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import AuthoredHead from "./AuthoredHead.vue";

const $i18n = {
  locale: "en",
};

const details = {
  title: "This is a page",
  contextLabel: "Story post",
};

describe("components/Authored/AuthoredHead", () => {
  it("shows a label", () => {
    const wrapper = shallowMount(AuthoredHead, {
      global: {
        mocks: {
          $config: { app: { internalLinkDomain: null } },
          $t: (val) => val,
          $i18n,
          localePath: () => "/",
        },
      },
      props: details,
    });

    expect(wrapper.find(".context-label").text()).toBe(details.contextLabel);
  });
});
