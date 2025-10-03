import { afterEach, describe, it, expect, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { shallowMount } from "@vue/test-utils";

import RelatedCategoryTags from "./RelatedCategoryTags.vue";

const trackMock = vi.fn((args) => args);

mockNuxtImport("useRoute", () => {
  return () => {
    return {
      path: "/path",
    };
  };
});

mockNuxtImport("useNuxtApp", () => {
  return () => {
    return {
      vueApp: {
        config: {
          globalProperties: {
            $matomo: {
              trackEvent: trackMock,
            },
          },
        },
      },
    };
  };
});

const factory = ({ props, mocks } = {}) =>
  shallowMount(RelatedCategoryTags, {
    props,
    global: {
      mocks: {
        ...mocks,
      },
    },
  });

describe("components/related/RelatedCategoryTags", () => {
  const routeName = "news";

  describe("template", () => {
    describe("when there are no tags", () => {
      const tags = [];

      it("does not display the tag icon", () => {
        const wrapper = factory({ props: { routeName, tags } });

        const tagIcon = wrapper.find(".icon-ic-tag");

        expect(tagIcon.exists()).toBe(false);
      });
    });

    describe("when there are tags", () => {
      const tags = [
        { identifier: "red-tape", name: "red tape" },
        { identifier: "white-wash", name: "white wash" },
      ];

      it("displays the tag icon", () => {
        const wrapper = factory({ props: { routeName, tags } });

        const tagIcon = wrapper.find(".icon-ic-tag");

        expect(tagIcon.exists()).toBe(true);
      });

      it("displays a badge for each tag", () => {
        const wrapper = factory({ props: { routeName, tags } });

        const badges = wrapper.findAll(".badge");

        expect(badges.length).toBe(tags.length);
      });

      it("excludes null tags", () => {
        const wrapper = factory({
          props: { routeName, tags: tags.concat([null]) },
        });

        const badges = wrapper.findAll(".badge");

        expect(badges.length).toBe(tags.length);
      });

      describe("clicking the badge", () => {
        afterEach(() => {
          trackMock.mockReset();
        });

        it("tracks selecting tag", async () => {
          const wrapper = factory({ props: { routeName, tags } });

          const badge = wrapper.find(".badge");

          await badge.trigger("click");

          expect(trackMock.mock.calls[0]).toEqual([
            "Tags",
            "Select tag",
            "red-tape",
          ]);
        });

        it("tracks deselecting tag", async () => {
          const wrapper = factory({
            props: { routeName, tags, selected: [tags[0].identifier] },
          });

          const badge = wrapper.find(".badge");

          await badge.trigger("click");

          expect(trackMock.mock.calls[0]).toEqual([
            "Tags",
            "Deselect tag",
            "red-tape",
          ]);
        });
      });
    });

    describe("methods", () => {
      const tags = [{ name: "red tape" }, { name: "white wash" }];
      const selected = ["red tape"];

      describe("badgeLink", () => {
        it("adds the tag to the url", () => {
          const wrapper = factory({ props: { routeName, tags } });
          const link = wrapper.vm.badgeLink("red tape");
          expect(link.query.tags).toBe("red tape");
        });

        it("adds another tag to the url", () => {
          const wrapper = factory({ props: { routeName, tags, selected } });
          const link = wrapper.vm.badgeLink("blue tape");
          expect(link.query.tags).toBe("red tape,blue tape");
        });

        it("removes the only tag from the url", () => {
          const wrapper = factory({ props: { routeName, tags, selected } });
          const link = wrapper.vm.badgeLink("red tape");
          expect(link.query.tags).toBe(undefined);
        });

        it("removes a tag from the url", () => {
          const wrapper = factory({
            props: { routeName, tags, selected: ["red tape", "blue tape"] },
          });
          const link = wrapper.vm.badgeLink("blue tape");
          expect(link.query.tags).toBe("red tape");
        });

        describe("when on page beyond the first page", () => {
          it("resets the page query", () => {
            const wrapper = factory({
              props: { routeName, tags },
              mocks: { $route: { query: { page: 2 } } },
            });

            const link = wrapper.vm.badgeLink("red tape");
            expect(link.query.page).toBe(undefined);
          });
        });
      });

      describe("isActive", () => {
        it("returns true when there is an active tag", () => {
          const wrapper = factory({ props: { routeName, tags, selected } });
          const active = wrapper.vm.isActive("red tape");

          expect(active).toBe(true);
        });
        it("returns false when there is not an active tag", () => {
          const wrapper = factory({ props: { routeName, tags } });
          const active = wrapper.vm.isActive("red tape");

          expect(active).toBe(false);
        });
      });
    });
  });
});
