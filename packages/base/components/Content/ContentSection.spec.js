import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import ContentSection from "./ContentSection.vue";

const contentRichText = { __typename: "ContentTypeRichText", text: "" };
const embed = { __typename: "Embed", embed: "" };
const imageWithAttribution = { __typename: "ImageWithAttribution" };
const link = { __typename: "Link", url: "", text: "" };

describe("components/Content/ContentSection", () => {
  describe("when the section is of type rich text", () => {
    it("renders the section as a content rich text", () => {
      const wrapper = shallowMount(ContentSection, {
        props: { section: contentRichText },
      });

      const richText = wrapper.find("content-rich-text-stub");

      expect(richText.exists()).toBe(true);
    });
  });
  describe("when the section is of type embed", () => {
    it("renders the section as an embed HTML", () => {
      const wrapper = shallowMount(ContentSection, {
        props: { section: embed },
      });

      const embedHTML = wrapper.find("embed-H-T-M-L-stub");

      expect(embedHTML.exists()).toBe(true);
    });
  });
  describe("when the section is of image with attribution", () => {
    it("renders the section as an image with attribution container", () => {
      const wrapper = shallowMount(ContentSection, {
        props: { section: imageWithAttribution },
      });

      const imageWithAttributionContainer = wrapper.find(
        "image-with-attribution-container-stub",
      );

      expect(imageWithAttributionContainer.exists()).toBe(true);
    });
  });
  describe("when the section is of type link", () => {
    it("renders the section as a call to action", () => {
      const wrapper = shallowMount(ContentSection, {
        props: { section: link },
      });

      const cta = wrapper.find("call-to-action-stub");

      expect(cta.exists()).toBe(true);
    });
  });
});
