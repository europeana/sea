import { describe, it, expect } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import NewsSlugPage from "./[slug].vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      locale: "en",
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
          associatedMediaCollection: {
            items: [
              {
                title: "Data Space Annual Report, 2025",
                url: "https://www.example.org/Data_Space_Annual_Report.2025.pdf",
              },
            ],
          },
          name: title,
        },
      ],
    },
  },
};
const factory = async () =>
  await mountSuspended(NewsSlugPage, {
    global: {
      provide: {
        $contentful: {
          query: () => contentfulResponse,
        },
      },
    },
  });

// TODO: add more tests
describe("NewsSlugPage", () => {
  it("renders an h1 element with the page name from Contentful", async () => {
    const wrapper = await factory();

    const h1 = wrapper.find("h1");

    expect(h1.text()).toBe(title);
  });

  describe("associated media links", () => {
    it("truncates the title and appends the filename extension in parentheses", async () => {
      const wrapper = await factory();

      const associatedMediaLink = wrapper.find(
        '[data-qa="associated media"] a',
      );

      expect(associatedMediaLink.text()).toBe("Data Space Annual Re… (PDF)");
    });
  });
});
