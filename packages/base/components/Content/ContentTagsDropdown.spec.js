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
      t: (key) => key,
      localeProperties: { value: { language: "en-GB" } },
    };
  };
});

const categoriesContentfulResponse = {
  data: {
    categoryCollection: {
      items: [
        { identifier: "3d", name: "3D" },
        { identifier: "cooking", name: "cooking" },
        { identifier: "postcards", name: "postcards" },
      ],
    },
  },
};

const factory = async (props, provide) =>
  await mountSuspended(ContentTagsDropdown, {
    global: {
      provide: {
        $contentful: {
          query: () => categoriesContentfulResponse,
        },
        ...provide,
      },
    },
    props,
  });

describe("components/content/contentTagsDropdown", () => {
  afterEach(() => {
    useRouteMock.mockReset();
  });

  it("fetches categories from Contentful", async () => {
    useRouteMock.mockImplementation(() => ({
      query: {},
    }));
    const wrapper = await factory();
    expect(wrapper.vm.tags.value.length).toBe(3);
  });

  describe("on focusin event", () => {
    it("makes the click outside handler active, opens the dropdown", async () => {
      const wrapper = await factory();
      await wrapper.vm.handleFocusin();
      expect(wrapper.vm.clickOutsideConfig.value.isActive).toBe(true);
      expect(wrapper.vm.showDropdown.value).toBe(true);
    });
  });

  describe("featured tags", () => {
    describe("when featured tags are supplied as props", () => {
      it("filters them out from display", async () => {
        const wrapper = await factory(
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
      it("displays all tags", async () => {
        const wrapper = await factory({
          filteredTags: ["3d", "cooking", "postcards"],
          selectedTags: ["cooking"],
        });

        expect(wrapper.vm.unfeaturedDisplayTags).toEqual(
          wrapper.vm.allDisplayTags,
        );
      });
    });
  });

  // TODO: The following tests don't work due to issues with setting data/props
  // and re-calculating computed properties.

  // describe('when searching for tag', () => {
  //   it('filters by keyword', async() => {
  //     useRouteMock.mockImplementation(() => ({
  //       query: {},
  //     }));
  //     const wrapper = await factory();
  //     wrapper.vm.searchTag.value = 'post';
  //     expect(wrapper.vm.allDisplayTags.length).toBe(1);
  //   });
  // });

  //   describe('showDropdown', () => {
  //     it('toggles the tag dropdown', async() => {
  //       const wrapper = factory();

  //       await wrapper.setData({
  //         showDropdown: true
  //       });

  //       const dropdown = wrapper.find('[data-qa="tags search dropdown"]');

  //       expect(dropdown.isVisible()).toBe(true);
  //     });
  //   });

  //   describe('when tags are filtered', () => {
  //     it('displays the filtered tags', async() => {
  //       const wrapper = await factory({ filteredTags });
  //       expect(wrapper.vm.displayTags).toBe(1);
  //     });
  //   });

  //   describe('when user clicks outside the search form dropdown', () => {
  //     it('hides the search options', async() => {
  //       const wrapper = factory();

  //       await wrapper.setData({ showDropdown: true });
  //       wrapper.vm.handleClickOutside();

  //       expect(wrapper.vm.showDropdown).toBe(false);
  //     });
  //   });

  //   describe('when user uses escape key', () => {
  //     it('hides the search options', async() => {
  //       const wrapper = factory();

  //       await wrapper.setData({ showDropdown: true });
  //       const dropdown = wrapper.find('[data-qa="tags dropdown"]');
  //       dropdown.trigger('keydown.esc');

  //       expect(wrapper.vm.showDropdown).toBe(false);
  //     });
  //   });
});
