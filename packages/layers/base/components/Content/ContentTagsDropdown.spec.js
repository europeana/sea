import { describe, it, expect, vi, afterEach } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import ContentTagsDropdown from "./ContentTagsDropdown.vue";

const { useRouteMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() => ({ query: {} })),
}));
mockNuxtImport("useRoute", () => useRouteMock);
mockNuxtImport("useI18n", () => {
  return () => {
    return {
      localeProperties: { value: { language: "en-GB" } },
    };
  };
});

const clickedOutside = ref(false);
const enableClickOutsideListeners = vi.fn();
const disableClickOutsideListeners = vi.fn();

vi.mock("~/composables/clickOutside", () => ({
  default: () => ({
    clickedOutside,
    enable: enableClickOutsideListeners,
    disable: disableClickOutsideListeners,
  }),
}));

const tags = [
  { identifier: "3d", name: "3D" },
  { identifier: "network", name: "network" },
  { identifier: "postcards", name: "postcards" },
];

const mockBlogCategories = [
  {
    categoriesCollection: { items: [{ identifier: "network" }] },
  },
  {
    categoriesCollection: { items: [{ identifier: "postcards" }] },
  },
  {
    categoriesCollection: { items: [{ identifier: "3d" }] },
  },
];

const contentfulResponse = (query, categories) => {
  if (query.definitions?.[0]?.name?.value === "BlogPostingCategories") {
    return Promise.resolve({
      data: { blogPostingCollection: { items: categories.blogs } },
      status: "success",
    });
  }
  // if (query.definitions?.[0]?.name?.value === "ProjectPageCategories") {
  //   return Promise.resolve({
  //     data: { projectPageCollection: { items: categories.projects } },
  //   });
  // }
  // if (query.definitions?.[0]?.name?.value === "EventCategories") {
  //   return Promise.resolve({
  //     data: { eventCollection: { items: categories.events } },
  //   });
  // }
};

const factory = (props, provide) =>
  mountSuspended(ContentTagsDropdown, {
    global: {
      provide: {
        $contentful: {
          query: (query) =>
            contentfulResponse(query, {
              blogs: mockBlogCategories,
            }),
        },
        ...provide,
      },
      stubs: ["ContentTagsList"],
    },
    props: {
      tags,
      supportedTaxonomiesAndTypes: ["BlogPosting"],
      site: "dataspace-culturalheritage.eu",
      ...props,
    },
  });

describe("components/Content/ContentTagsDropdown", () => {
  afterEach(() => {
    useRouteMock.mockReset();
  });

  describe("on focusin event", () => {
    it("makes the click outside handler active, opens the dropdown", async () => {
      const wrapper = await factory();
      await wrapper.vm.handleFocusin();

      expect(enableClickOutsideListeners).toHaveBeenCalled();
      expect(wrapper.vm.showDropdown).toBe(true);
    });
  });

  describe("featured tags", () => {
    describe("when featured tags are supplied as props", () => {
      it("filters them out from display", async () => {
        const wrapper = await factory(
          {
            selectedTags: ["network"],
          },
          { featuredContentTags: ["3d"] },
        );

        expect(wrapper.vm.unfeaturedDisplayTags).not.toEqual(
          wrapper.vm.allDisplayTags,
        );
      });
    });
    describe("when no featured tags are supplied", () => {
      it("displays all tags", async () => {
        const wrapper = await factory({
          selectedTags: ["network"],
        });

        expect(wrapper.vm.unfeaturedDisplayTags).toEqual(
          wrapper.vm.allDisplayTags,
        );
      });
    });
  });

  describe("when searching for tag", () => {
    it("filters by keyword", async () => {
      const wrapper = await factory();
      wrapper.vm.searchTag = "post";
      await nextTick();

      wrapper.vm.showDropdown = true;
      await nextTick();
      expect(wrapper.vm.allDisplayTags.length).toBe(1);
    });
  });

  // describe("when dropdown is shown and fetch state success", () => {
  //   it("toggles the tag dropdown", async () => {
  //     const wrapper = await factory();

  //     wrapper.vm.showDropdown = true;
  //     await nextTick();

  //     wrapper.vm.showDropdown = true;
  //     await nextTick();
  //     const dropdown = wrapper.find('[data-qa="tags search dropdown"]');

  //     expect(dropdown.isVisible()).toBe(true);
  //   });
  // });

  describe("when user clicks outside the search form dropdown", () => {
    it("hides the search options and disables click outside listeners", async () => {
      const wrapper = await factory();

      wrapper.vm.showDropdown = true;
      clickedOutside.value = true;
      await nextTick();

      expect(wrapper.vm.showDropdown).toBe(false);
      expect(disableClickOutsideListeners).toHaveBeenCalled();
    });
  });

  describe("when user uses escape key", () => {
    it("hides the search options and disables click outside listeners", async () => {
      const wrapper = await factory();

      wrapper.vm.showDropdown = true;
      await nextTick();
      const dropdown = wrapper.find('[data-qa="tags dropdown"]');
      dropdown.trigger("keydown.esc");

      expect(wrapper.vm.showDropdown).toBe(false);
      expect(disableClickOutsideListeners).toHaveBeenCalled();
    });
  });
});
