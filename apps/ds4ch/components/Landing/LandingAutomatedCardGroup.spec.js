import { describe, it, expect } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { shallowMount } from "@vue/test-utils";

import LandingAutomatedCardGroup from "./LandingAutomatedCardGroup.vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      t: (key) => key,
      n: (key) => key,
    };
  };
});

const testProps = {
  genre: "Data space numbers",
};

const factory = (props = testProps) =>
  shallowMount(LandingAutomatedCardGroup, {
    props,
  });

describe("components/landing/LandingAutomatedCardGroup", () => {
  it("renders a landing-automated-card-group", () => {
    const wrapper = factory();

    const LandingAutomatedCardGroup = wrapper.find(
      ".landing-automated-card-group",
    );
    expect(LandingAutomatedCardGroup.isVisible()).toBe(true);
  });

  // TODO: add tests for actual data/data retrieval

  describe("methods", () => {
    describe("roundedNumber", () => {
      it("rounds down a number to a precision of two", () => {
        const wrapper = factory();

        expect(wrapper.vm.roundedNumber(199)).toBe(190);
        expect(wrapper.vm.roundedNumber(21367)).toBe(21000);
        expect(wrapper.vm.roundedNumber(3591434)).toBe(3500000);
      });
    });
  });
});
