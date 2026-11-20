import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import ErrorMessage from "./ErrorMessage.vue";

mockNuxtImport("useI18n", () => () => ({
  t: (key) => key,
  te: (key) =>
    [
      "errorMessage.404",
      "errorMessage.noResults",
      "errorMessage.noResultsDescription",
    ].includes(key),
}));

const errorImage = {
  image: {
    url: "https://www.example.eu/image.webp",
  },
};
const factory = (props) =>
  shallowMount(ErrorMessage, {
    props,
  });

describe("components/Error/ErrorMessage", () => {
  describe("when passed an image for a custom error message", () => {
    describe("when passed a 404 error", () => {
      it("renders the right title and no alert message", () => {
        const wrapper = factory({ error: { statusCode: 404 }, errorImage });

        expect(wrapper.find("h1").text()).toEqual("errorMessage.404");
        expect(wrapper.findComponent({ name: "AlertMessage" }).exists()).toBe(
          false,
        );
      });
    });
    describe("when passed a 'no results' error", () => {
      it("renders the right title and no alert message", () => {
        const wrapper = factory({
          error: { message: "No results" },
          errorImage,
        });

        expect(wrapper.find("h1").text()).toEqual("errorMessage.noResults");
        expect(wrapper.findComponent({ name: "AlertMessage" }).exists()).toBe(
          false,
        );
      });
    });
    describe("when passed a different error", () => {
      it("renders the unknown error title and an alert message", () => {
        const wrapper = factory({ error: { statusCode: 520 }, errorImage });

        expect(wrapper.find("h1").text()).toEqual("errorMessage.unknown");
        expect(wrapper.findComponent({ name: "AlertMessage" }).exists()).toBe(
          true,
        );
      });
    });
    describe("when passed a title tag", () => {
      it("renders the right HTML tag for the title", () => {
        const wrapper = factory({
          error: { message: "No results" },
          errorImage,
          titleTag: "h2",
        });

        expect(wrapper.find("h1.title").exists()).toBe(false);
        expect(wrapper.find("h2.title").exists()).toBe(true);
      });
    });
    describe("when description exists in the translations for the error", () => {
      it("renders the description text", () => {
        const wrapper = factory({
          error: { message: "No results" },
          errorImage,
        });

        expect(wrapper.find(".description").exists()).toBe(true);
      });
    });
  });

  describe("when not passed an image for a custom error message", () => {
    it("renders only an alert message", () => {
      const wrapper = factory({ error: { statusCode: 404 } });

      expect(wrapper.find(".error-explanation").exists()).toBe(false);
      expect(wrapper.findComponent({ name: "AlertMessage" }).exists()).toBe(
        true,
      );
    });
  });
});
