import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ContentRichText from "./ContentRichText.vue";

const factory = () =>
  mount(ContentRichText, {
    propsData: {
      text: "__This is bold text__",
    },
  });

describe("components/Content/ContentRichText", () => {
  it("shows bold text", () => {
    const wrapper = factory();
    const markdown = wrapper.find('[data-qa="markdown"]');

    expect(markdown.html()).toContain("<strong>This is bold text</strong>");
  });

  it("shows in a card", async () => {
    const wrapper = factory();
    await wrapper.setProps({ richTextIsCard: true });

    const markdown = wrapper.find('[data-qa="markdown"]');
    expect(markdown.find("div.card").exists()).toBe(true);
  });

  it("shows in as text", async () => {
    const wrapper = factory();
    await wrapper.setProps({ richTextIsCard: false });

    const markdown = wrapper.find('[data-qa="markdown"]');
    expect(markdown.find("div.card").exists()).toBe(false);
  });
});
