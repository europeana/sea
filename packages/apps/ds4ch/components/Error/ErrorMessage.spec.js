import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import ErrorMessage from "./ErrorMessage.vue";

const { useI18nMock } = vi.hoisted(() => ({
  useI18nMock: vi.fn(() => {
    return {
      t: (key) => key,
      te: () => true,
    };
  }),
}));
mockNuxtImport("useI18n", () => useI18nMock);

const factory = (props) =>
  shallowMount(ErrorMessage, {
    props,
  });

describe("components/Error/ErrorMessage", () => {
  describe("when passed a 404 error", () => {
    it("renders the right title and no alert message", () => {
      const wrapper = factory({ error: { statusCode: 404 } });
      expect(wrapper.find("h1").text()).toEqual("errorMessage.404");
      expect(wrapper.findComponent({ name: "AlertMessage" }).exists()).toBe(
        false,
      );
    });
  });
  describe("when passed a different error", () => {
    it("renders the unknown error title and an alert message", () => {
      useI18nMock.mockImplementation(() => ({
        t: (key) => key,
        te: () => false,
      }));

      const wrapper = factory({ error: { statusCode: 520 } });
      expect(wrapper.find("h1").text()).toEqual("errorMessage.unknown");
      expect(wrapper.findComponent({ name: "AlertMessage" }).exists()).toBe(
        true,
      );
    });
  });
});
