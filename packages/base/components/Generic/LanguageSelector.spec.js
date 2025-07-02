import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import LanguageSelector from "./LanguageSelector.vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      locale: { value: "en" },
      locales: {
        value: [
          { code: "cs", name: "Čeština" },
          { code: "en", name: "English" },
          { code: "nl", name: "Nederlands" },
        ],
      },
    };
  };
});

describe("LanguageSelector", () => {
  it("renders a dropdown", () => {
    const wrapper = shallowMount(LanguageSelector);
    const dropdown = wrapper.find(".dropdown");

    expect(dropdown.exists()).toBe(true);
  });

  it("has the current locale name as a button label", () => {
    const wrapper = shallowMount(LanguageSelector);
    const button = wrapper.find("button.dropdown-toggle");

    expect(button.text()).toBe("English");
  });

  it("contains language links to alternate language versions of the current page", () => {
    const wrapper = shallowMount(LanguageSelector);
    const options = wrapper.findAll("li");

    expect(options.length).toEqual(2);
  });
});
