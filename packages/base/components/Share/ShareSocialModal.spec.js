import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import ShareSocialModal from "./ShareSocialModal.vue";

const testProps = {
  mediaUrl: "https://example.org/media.jpg",
};

describe("components/landing/ShareSocialModal", () => {
  it("renders a title", () => {
    const wrapper = shallowMount(ShareSocialModal, { props: testProps });

    const header = wrapper.find("h2");
    expect(header.text()).toContain("actions.share");
  });

  it("renders a description", () => {
    const wrapper = shallowMount(ShareSocialModal, { props: testProps });

    const description = wrapper.find("p");
    expect(description.text()).toContain("shareWhere");
  });

  it("renders share buttons", () => {
    const wrapper = shallowMount(ShareSocialModal, { props: testProps });

    const socialButtons = wrapper.find("share-social-buttons-stub");
    expect(socialButtons.exists()).toBe(true);
  });

  it("renders a close button", () => {
    const wrapper = shallowMount(ShareSocialModal, { props: testProps });

    const button = wrapper.find("button");
    expect(button.text()).toContain("actions.close");
  });
});
