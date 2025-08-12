import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

import RelatedCategoryTags from "./RelatedCategoryTags.vue";

mockNuxtImport("useLocalePath", () => {
  return () => (opts) => opts;
});

const factory = ({ props, mocks } = {}) =>
  shallowMount(RelatedCategoryTags, {
    props,
    global: {
      mocks: {
        // $matomo: { trackEvent: sinon.spy() },
        ...mocks,
      },
    },
  });

describe("components/related/RelatedCategoryTags", () => {
  describe("template", () => {
    describe("when there are no tags", () => {
      const tags = [];

      it("does not display the tag icon", () => {
        const wrapper = factory({ props: { tags } });

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
        const wrapper = factory({ props: { tags } });

        const tagIcon = wrapper.find(".icon-ic-tag");

        expect(tagIcon.exists()).toBe(true);
      });

      it("displays a badge for each tag", () => {
        const wrapper = factory({ props: { tags } });

        const badges = wrapper.findAll(".badge");

        expect(badges.length).toBe(tags.length);
      });

      it("excludes null tags", () => {
        const wrapper = factory({ props: { tags: tags.concat([null]) } });

        const badges = wrapper.findAll(".badge");

        expect(badges.length).toBe(tags.length);
      });

      // describe("clicking the badge", () => {
      //   it("tracks selecting tag", () => {
      //     const wrapper = factory({ props: { tags } });

      //     const badge = wrapper.find(".badge");

      //     badge.trigger("click.native");

      //     expect(
      //       wrapper.vm.$matomo.trackEvent.calledWith(
      //         "Tags",
      //         "Select tag",
      //         "red-tape",
      //       ),
      //     ).toBe(true);
      //   });

      //   it("tracks deselecting tag", () => {
      //     const wrapper = factory({
      //       props: { tags, selected: [tags[0].identifier] },
      //     });

      //     const badge = wrapper.find(".badge");

      //     badge.trigger("click.native");

      //     expect(
      //       wrapper.vm.$matomo.trackEvent.calledWith(
      //         "Tags",
      //         "Deselect tag",
      //         "red-tape",
      //       ),
      //     ).toBe(true);
      //   });
      // });
    });

    describe("methods", () => {
      const tags = [{ name: "red tape" }, { name: "white wash" }];
      const selected = ["red tape"];

      describe("badgeLink", () => {
        it("adds the tag to the url", () => {
          const wrapper = factory({ props: { tags } });
          const link = wrapper.vm.badgeLink("red tape");
          expect(link.query.tags).toBe("red tape");
        });

        it("adds another tag to the url", () => {
          const wrapper = factory({ props: { tags, selected } });
          const link = wrapper.vm.badgeLink("blue tape");
          expect(link.query.tags).toBe("red tape,blue tape");
        });

        it("removes the only tag from the url", () => {
          const wrapper = factory({ props: { tags, selected } });
          const link = wrapper.vm.badgeLink("red tape");
          expect(link.query.tags).toBe(undefined);
        });

        it("removes a tag from the url", () => {
          const wrapper = factory({
            props: { tags, selected: ["red tape", "blue tape"] },
          });
          const link = wrapper.vm.badgeLink("blue tape");
          expect(link.query.tags).toBe("red tape");
        });

        describe("when on page beyond the first page", () => {
          it("resets the page query", () => {
            const wrapper = factory({
              props: { tags },
              mocks: { $route: { query: { page: 2 } } },
            });

            const link = wrapper.vm.badgeLink("red tape");
            expect(link.query.page).toBe(undefined);
          });
        });
      });

      describe("isActive", () => {
        it("returns true when there is an active tag", () => {
          const wrapper = factory({ props: { tags, selected } });
          const active = wrapper.vm.isActive("red tape");

          expect(active).toBe(true);
        });
        it("returns false when there is not an active tag", () => {
          const wrapper = factory({ props: { tags } });
          const active = wrapper.vm.isActive("red tape");

          expect(active).toBe(false);
        });
      });
    });
  });
});
