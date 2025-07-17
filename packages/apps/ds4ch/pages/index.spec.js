import { describe, it, expect } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import IndexPage from "./index.vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      localeProperties: { value: { language: "en-GB" } },
    };
  };
});

describe("IndexPage", () => {
  it("renders an h1 element with the page title from Contentful", async () => {
    const title = "DS4CH home page";
    const contentfulResponse = {
      data: {
        landingPageCollection: {
          items: [
            {
              name: title,
            },
          ],
        },
      },
    };
    const wrapper = await mountSuspended(IndexPage, {
      global: {
        provide: {
          $contentful: {
            query: () => contentfulResponse,
          },
        },
      },
    });

    const h1 = wrapper.find("h1");

    expect(h1.text()).toBe(title);
  });
});
