import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import ContentFeaturedTags from "./ContentFeaturedTags.vue";

const tagsProp = [
  { identifier: "3d", name: "3D" },
  { identifier: "cooking", name: "cooking" },
  { identifier: "postcards", name: "postcards" },
];

const factory = (props, provide) =>
  shallowMount(ContentFeaturedTags, {
    global: {
      provide: {
        ...provide,
      },
    },
    props: { tags: tagsProp, ...props },
  });

describe("components/Content/ContentFeaturedTags", () => {
  describe("featured tags", () => {
    describe("when featured tags are supplied as props", () => {
      it("splits the tags into featured section", () => {
        const wrapper = factory({}, { featuredContentTags: ["3d"] });

        expect(wrapper.vm.featuredDisplayTags).toEqual([
          {
            identifier: "3d",
            name: "3D",
          },
        ]);
        expect(wrapper.find(".featured-tags").exists()).toBe(true);
      });
    });
    describe("when no featured tags are supplied", () => {
      it("does not create seperate section", () => {
        const wrapper = factory();

        expect(wrapper.vm.featuredDisplayTags).toEqual([]);
        expect(wrapper.find(".featured-tags").exists()).toBe(false);
      });
    });

    // TODO: test selected state, scrollWidth on mounted and resize
  });
});
