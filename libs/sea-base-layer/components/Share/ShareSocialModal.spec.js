import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import ShareSocialModal from "./ShareSocialModal.vue";

describe("components/landing/ShareSocialModal", () => {
  it("renders a title", () => {
    const wrapper = shallowMount(ShareSocialModal);

    const header = wrapper.find("h2");
    expect(header.text()).toContain("actions.share");
  });

  it("renders a description", () => {
    const wrapper = shallowMount(ShareSocialModal);

    const description = wrapper.find("p");
    expect(description.text()).toContain("shareWhere");
  });

  it("renders share buttons", () => {
    const wrapper = shallowMount(ShareSocialModal);

    const socialButtons = wrapper.findAll("share-social-link-stub");
    expect(socialButtons.length).toBe(2);
  });

  it("renders a close button", () => {
    const wrapper = shallowMount(ShareSocialModal);

    const button = wrapper.find("button");
    expect(button.text()).toContain("actions.close");
  });
});
