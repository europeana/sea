import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import FeedbackButton from "./FeedbackButton.vue";

describe("FeedbackButton", () => {
  it('is labelled "Feedback"', () => {
    const wrapper = mount(FeedbackButton);

    expect(wrapper.text()).toContain("feedback");
  });

  it("shows the feedback icon in a button", () => {
    const wrapper = mount(FeedbackButton);

    const icon = wrapper.find("button svg.icon-ic-feedback");

    expect(icon.isVisible()).toBe(true);
  });
});
