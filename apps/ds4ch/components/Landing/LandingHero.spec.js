import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import LandingHero from "./LandingHero.vue";

const testProps = {
  headline: "Headline text",
  text: "Header text",
};

describe("components/landing/LandingHero", () => {
  it("renders a header containing the title and text", () => {
    const wrapper = shallowMount(LandingHero, { props: testProps });

    const header = wrapper.find("header");
    expect(header.text()).toContain("Headline text");
    expect(header.text()).toContain("Header text");
  });
});
