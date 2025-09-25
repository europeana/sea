import { describe, it, expect, vi, afterEach } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import ContentTagsDropdown from "./ContentTagsDropdown.vue";

const { useRouteMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() => {}),
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

// const filteredTags = ['3d'];

const factory = async (props) =>
  await mountSuspended(ContentTagsDropdown, {
    global: {
      provide: {
        $contentful: {
          query: () => categoriesContentfulResponse,
        },
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
      useRouteMock.mockImplementation(() => ({
        query: {},
      }));
      const wrapper = await factory();
      await wrapper.vm.handleFocusin();
      expect(wrapper.vm.clickOutsideConfig.value.isActive).toBe(true);
      expect(wrapper.vm.showDropdown.value).toBe(true);
    });
  });

  describe("featured tags", () => {
    describe("when featured tags are supplied as props", () => {
      it("splits the tags into featured and non-featured sections", async () => {
        useRouteMock.mockImplementation(() => ({
          query: {},
        }));
        const wrapper = await factory({
          featuredTags: ["3d"],
          filteredTags: ["3d", "cooking", "postcards"],
          selectedTags: ["cooking"],
        });
        await wrapper.vm.handleFocusin(); // open dropdown

        const tagSectionHedings = wrapper.findAll("h2.related-heading");

        expect(tagSectionHedings[0].text()).toMatch("categories.featuredTags");
        expect(tagSectionHedings[1].text()).toMatch("categories.moreTags");
      });
    });
    describe("when no featured tags are supplied", () => {
      it("does not create seperate sections or add section headers", async () => {
        useRouteMock.mockImplementation(() => ({
          query: {},
        }));
        const wrapper = await factory({
          filteredTags: ["3d", "cooking", "postcards"],
          selectedTags: ["cooking"],
        });
        await wrapper.vm.handleFocusin(); // open dropdown

        const tagSectionHedings = wrapper.find("h2.related-heading");
        expect(tagSectionHedings.exists()).toBe(false);
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
