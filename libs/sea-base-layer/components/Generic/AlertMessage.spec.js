import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import AlertMessage from "./AlertMessage.vue";

const factory = (props) =>
  shallowMount(AlertMessage, {
    props,
  });

describe("components/generic/AllertMessage", () => {
  describe("when passed an error string", () => {
    it("renders the labeled string in an alert div", () => {
      const wrapper = factory({ error: "error string" });

      const div = wrapper.find(".alert");
      expect(div.text()).toBe("error: error string");
    });
  });
  describe("when passed an error object", () => {
    it("renders the labeled message in an alert div", () => {
      const wrapper = factory({ error: new Error("error message") });

      const div = wrapper.find(".alert");
      expect(div.text()).toBe("error: error message");
    });
  });
  describe("when passed another object", () => {
    it("renders the labeled object in an alert div", () => {
      const wrapper = factory({ error: { key: "value" } });

      const div = wrapper.find(".alert");
      expect(div.text()).toContain(`"key": "value"`);
    });
  });
});
