import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import ShareButton from "./ShareButton.vue";

const testProps = {
  headline: "Headline text",
  text: "Header text",
};

describe("components/landing/ShareButton", () => {
  it("renders a button", () => {
    const wrapper = shallowMount(ShareButton, { props: testProps });

    const button = wrapper.find("button");
    expect(button.exists()).toBe(true);
  });
});
