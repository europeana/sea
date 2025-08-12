import { vi, describe, it, expect } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import slugPage from "./[slug].vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      localeProperties: { value: { language: "en-GB" } },
    };
  };
});

const { useRouteMock } = vi.hoisted(() => {
  return {
    useRouteMock: vi.fn(() => {
      return { params: { slug: "example" } };
    }),
  };
});

mockNuxtImport("useRoute", () => {
  return useRouteMock;
});

const title = "DS4CH about us";
const description = "DS4CH text";
const contentfulResponse = {
  data: {
    landingPageCollection: {
      items: [
        {
          headline: title,
          text: description,
          primaryImageOfPage: { image: "stubed Image" },
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

describe("slugPage", () => {
  it("renders landing hero with the attributes from Contentful", async () => {
    const wrapper = await factory();

    const landingHero = wrapper.find(".landing-hero");

    expect(landingHero.text()).toContain(title);
    expect(landingHero.text()).toContain(description);
  });

  describe('when the slug is "data-space"', () => {
    it("renders the alternate variant of the hero", async () => {
      useRouteMock.mockImplementation(() => {
        return { params: { slug: "data-space" } };
      });
      const wrapper = await factory();

      expect(wrapper.vm.heroVariant).toBe("alternate");
    });
  });
});
