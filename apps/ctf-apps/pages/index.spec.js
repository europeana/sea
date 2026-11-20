import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import IndexPage from "./index.vue";

const factory = async () => await mountSuspended(IndexPage, {});

describe("IndexPage", () => {
  it("renders heading", async () => {
    const wrapper = await factory();

    const h1 = wrapper.find("h1");

    expect(h1.text()).toContain("Contentful apps");
  });
});
