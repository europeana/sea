import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PersonCard from "./PersonCard.vue";

const testProps = {
  image: {
    url: "https://images.ctfassets.net/asset",
    width: 400,
    height: 600,
  },
};

const factory = (props = testProps) =>
  mount(PersonCard, {
    props,
  });

describe("components/content/PersonCard", () => {
  it("displays a face focused, round, cropped, optimised image", () => {
    const wrapper = factory();
    expect(wrapper.find("img").attributes("srcset")).toContain(
      "w=120&h=120&fit=fill&f=face&r=100&q=80&fm=webp",
    );
  });
});
