import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import IndexPage from "./index.vue";

const factory = async () => await mountSuspended(IndexPage, {});

describe("IndexPage", () => {
  it("renders info text", async () => {
    const wrapper = await factory();

    const div = wrapper.find(".contentful-app");

    expect(div.text()).toBe("Hello from contentful app index page!");
  });
});
