import { describe, it, expect, vi, afterEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { shallowMount } from "@vue/test-utils";
import ContentTagsDropdown from "./ContentTagsDropdown.vue";
import { nextTick } from "vue";

const { useRouteMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() => ({ query: {} })),
}));
mockNuxtImport("useRoute", () => useRouteMock);

const tags = [
  { identifier: "3d", name: "3D" },
  { identifier: "cooking", name: "cooking" },
  { identifier: "postcards", name: "postcards" },
];

const factory = (props, provide) =>
  shallowMount(ContentTagsDropdown, {
    global: {
      provide,
    },
    props: {
      tags,
      ...props,
    },
  });

describe("components/Content/ContentTagsDropdown", () => {
  afterEach(() => {
    useRouteMock.mockReset();
  });

  describe("on focusin event", () => {
    it("makes the click outside handler active, opens the dropdown", async () => {
      const wrapper = factory();
      await wrapper.vm.handleFocusin();
      expect(wrapper.vm.clickOutsideActive).toBe(true);
      expect(wrapper.vm.showDropdown).toBe(true);
    });
  });

  describe("featured tags", () => {
    describe("when featured tags are supplied as props", () => {
      it("filters them out from display", () => {
        const wrapper = factory(
          {
            filteredTags: ["3d", "cooking", "postcards"],
            selectedTags: ["cooking"],
          },
          { featuredContentTags: ["3d"] },
        );

        expect(wrapper.vm.unfeaturedDisplayTags).not.toEqual(
          wrapper.vm.allDisplayTags,
        );
      });
    });
    describe("when no featured tags are supplied", () => {
      it("displays all tags", () => {
        const wrapper = factory({
          filteredTags: ["3d", "cooking", "postcards"],
          selectedTags: ["cooking"],
        });

        expect(wrapper.vm.unfeaturedDisplayTags).toEqual(
          wrapper.vm.allDisplayTags,
        );
      });
    });
  });

  describe("when searching for tag", () => {
    it("filters by keyword", async () => {
      const wrapper = factory();
      wrapper.vm.searchTag = "post";
      await nextTick();
      expect(wrapper.vm.allDisplayTags.length).toBe(1);
    });
  });

  describe("showDropdown", () => {
    it("toggles the tag dropdown", async () => {
      const wrapper = factory();
      wrapper.vm.showDropdown = true;
      await nextTick();
      const dropdown = wrapper.find('[data-qa="tags search dropdown"]');

      expect(dropdown.isVisible()).toBe(true);
    });
  });

  describe("when tags are filtered", () => {
    it("displays only the filtered tags", () => {
      const wrapper = factory({ filteredTags: ["3d"] });
      expect(wrapper.vm.allDisplayTags.length).toBe(1);
    });
  });

  describe("when user clicks outside the search form dropdown", () => {
    it("hides the search options", async () => {
      const wrapper = factory();

      wrapper.vm.showDropdown = true;
      await nextTick();
      wrapper.vm.handleClickOutside();

      expect(wrapper.vm.showDropdown).toBe(false);
    });
  });

  describe("when user uses escape key", () => {
    it("hides the search options", async () => {
      const wrapper = factory();

      wrapper.vm.showDropdown = true;
      await nextTick();
      const dropdown = wrapper.find('[data-qa="tags dropdown"]');
      dropdown.trigger("keydown.esc");

      expect(wrapper.vm.showDropdown).toBe(false);
    });
  });
});
