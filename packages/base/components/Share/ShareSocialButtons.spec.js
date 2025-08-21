import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import ShareSocialButtons from "./ShareSocialButtons.vue";

const testProps = {
  mediaUrl: "https://example.com/media.jpg",
};

describe("components/Share/ShareSocialButtons", () => {
  it("renders a link for each of the sharing options", () => {
    const wrapper = shallowMount(ShareSocialButtons, { props: testProps });

    const links = wrapper.findAll("nuxt-link-stub");

    expect(links.length).toBe(2);
  });
});
