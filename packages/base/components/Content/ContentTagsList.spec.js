import { afterEach, describe, it, expect, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { shallowMount } from "@vue/test-utils";

import ContentTagsList from "./ContentTagsList.vue";
import { nextTick } from "vue";

const trackEventMock = vi.fn((args) => args);

mockNuxtImport("useMatomo", () => () => ({
  matomo: { value: { trackEvent: trackEventMock } },
}));
mockNuxtImport("useRoute", () => () => ({ path: "/path" }));

const scrollToSelector = vi.fn();
vi.mock("@/composables/scrollTo.js", () => ({
  default: () => ({
    scrollToSelector,
  }),
}));

const factory = ({ props, mocks } = {}) =>
  shallowMount(ContentTagsList, {
    props,
    global: {
      mocks: {
        ...mocks,
      },
    },
  });

describe("components/Content/ContentTagsList", () => {
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
          trackEventMock.mockReset();
        });

        it("tracks selecting tag", async () => {
          const wrapper = factory({ props: { routeName, tags } });

          const badge = wrapper.find(".badge");

          await badge.trigger("click");

          expect(trackEventMock.mock.calls[0]).toEqual([
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

          expect(trackEventMock.mock.calls[0]).toEqual([
            "Tags",
            "Deselect tag",
            "red-tape",
          ]);
        });
      });

      describe("when bubble up is enabled", () => {
        it("orders by selected state", () => {
          const wrapper = factory({
            props: {
              bubbleUp: true,
              routeName,
              tags,
              selected: ["white-wash"],
            },
          });

          expect(wrapper.vm.orderedTags[0].name).toBe(tags[1].name);
        });
      });

      describe("order of tags changes", () => {
        it("scrolls to the container start", async () => {
          const wrapper = factory({
            props: {
              bubbleUp: true,
              routeName,
              tags,
            },
          });

          const tagswrapperEl = wrapper.vm.$refs.tagswrapper;

          expect(scrollToSelector).not.toHaveBeenCalled();

          wrapper.setProps({ selected: ["white-wash"] });

          await nextTick();

          expect(scrollToSelector).toHaveBeenCalledWith("div", {
            behavior: "smooth",
            container: tagswrapperEl,
          });
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
