import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import DocumentLinkSection from "./DocumentLinkSection.vue";

const factory = ({ data, props } = {}) =>
  shallowMount(DocumentLinkSection, {
    data() {
      return {
        ...data,
      };
    },
    props: {
      headline: "label",
      url: "https://example.org/filesystem/directory",
      ...props,
    },
  });

describe("components/File/DocumentLinkSection", () => {
  it("the headline as a title", () => {
    const wrapper = factory();

    const label = wrapper.find("h2");
    expect(label.exists()).toBe(true);
    expect(label.text()).toEqual("label");
  });
});
