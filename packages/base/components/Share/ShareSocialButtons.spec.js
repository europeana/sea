import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import ShareSocialButtons from "./ShareSocialButtons.vue";

const testProps = {
  mediaUrl: "https://example.com/media.jpg",
};

describe("components/landing/ShareSocialButtons", () => {
  it("renders a button for each of the sharing options", () => {
    const wrapper = shallowMount(ShareSocialButtons, { props: testProps });

    const buttons = wrapper.findAll("button");
    expect(buttons[0].text()).toContain("Facebook");
    expect(buttons[1].text()).toContain("Bluesky");
    expect(buttons[2].text()).toContain("Pinterest");
  });
});
