import { describe, it, expect } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import slugPage from "./[slug].vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      localeProperties: { value: { language: "en-GB" } },
    };
  };
});

const title = "DS4CH news post";
const contentfulResponse = {
  data: {
    blogPostingCollection: {
      items: [
        {
          name: title,
        },
      ],
    },
  },
};
const factory = async () =>
  await mountSuspended(slugPage, {
    global: {
      provide: {
        $contentful: {
          query: () => contentfulResponse,
        },
      },
    },
  });

// TODO: add more tests
describe("slugPage", () => {
  it("renders an h1 element with the page name from Contentful", async () => {
    const wrapper = await factory();

    const h1 = wrapper.find("h1");

    expect(h1.text()).toBe(title);
  });
});
