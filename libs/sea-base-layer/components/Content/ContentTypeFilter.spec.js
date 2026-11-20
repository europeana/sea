import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";

import ContentTypeFilter from "./ContentTypeFilter.vue";

const i18n = createI18n({
  messages: {
    en: {
      content: {
        filter: {
          viewAll: "View All",
          news: "News",
          projects: "Projects",
        },
      },
    },
  },
});

const factory = (props = { contentTypes: [] }) =>
  shallowMount(ContentTypeFilter, {
    props,
    global: {
      plugins: [i18n],
    },
  });
describe("components/Content/ContentTypeFilter", () => {
  it("renders the 'view all' button", () => {
    const wrapper = factory();

    const buttons = wrapper.findAll("#content-filter-navbar smart-link-stub");

    expect(buttons.length).toBe(1);
  });
  describe("when content types are supplied", () => {
    it("renders buttons for each option plus the 'view all' button", () => {
      const wrapper = factory({ contentTypes: ["blog post", "project"] });

      const buttons = wrapper.findAll("#content-filter-navbar smart-link-stub");

      expect(buttons.length).toBe(3);
    });
  });

  it("renders distinct buttons for the mobile dropdown", () => {
    const wrapper = factory({ contentTypes: ["blog post", "project"] });

    const buttons = wrapper.findAll(".dropdown-menu smart-link-stub");

    expect(buttons.length).toBe(3);
  });
});
