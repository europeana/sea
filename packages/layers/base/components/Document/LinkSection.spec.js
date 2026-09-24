import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import LinkSection from "./LinkSection";

const factory = ({ data, props } = {}) =>
  shallowMount(LinkSection, {
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

describe("components/Document/LinkSection", () => {
  it("the headline as a title", () => {
    const wrapper = factory();

    const label = wrapper.find("h2");
    expect(label.exists()).toBe(true);
    expect(label.text()).toEqual("label");
  });
});
