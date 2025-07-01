import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";

import LanguageSelector from "./LanguageSelector.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    locale: { value: "en" },
    locales: {
      value: [
        { code: "en", name: "English" },
        { code: "nl", name: "Nederlands" },
      ],
    },
  }),
}));

describe("LanguageSelector", () => {
  it("renders a dropdown", async () => {
    const wrapper = await shallowMount(LanguageSelector);
    const dropdown = wrapper.find(".dropdown");

    expect(dropdown.exists()).toBe(true);
  });

  it("has the current locale name as a button label", async () => {
    const wrapper = await shallowMount(LanguageSelector);
    const button = wrapper.find("button .dropdown-toggle");

    expect(button.text()).toBe("English");
  });

  it("contains language links to alternate lanaguage versions of the current page", async () => {
    const wrapper = await shallowMount(LanguageSelector);
    const options = wrapper.findAll("li");

    expect(options.length).toEqual(2);
  });
});
