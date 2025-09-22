import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import ContentInterface from "./ContentInterface.vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      d: (datetime) => datetime,
      locale: "en",
      localeProperties: { value: { language: "en-GB" } },
      t: (key) => key,
    };
  };
});

const mockContentResponse = {
  data: {
    storyCollection: { items: [] },
    exhibitionPageCollection: { items: [] },
    blogPostingCollection: {
      items: Array.from({ length: 24 }, (index) => ({
        __typename: "BlogPosting",
        sys: { id: `id${index}` },
        datePublished: `2023-01-${index}`,
        name: `Entry ${index}`,
      })),
    },
    projectPageCollection: { items: [] },
  },
};

const mockQuery = vi.fn().mockResolvedValue(mockContentResponse);

const factory = (props = {}) =>
  shallowMount(ContentInterface, {
    global: {
      provide: {
        $contentful: { query: mockQuery },
      },
      mocks: {
        $route: {
          query: { page: 1 },
        },
      },
    },
    props: {
      contentTypes: ["blog post"],
      site: "dataspace-culturalheritage.eu",
      ...props,
    },
  });

describe("components/content/contentInterface", () => {
  describe("isCtaBanner", () => {
    it("detects CTA banner strings correctly", async () => {
      const wrapper = factory();

      expect(wrapper.vm.isCtaBanner("cta-banner-0")).toBe(true);
      expect(wrapper.vm.isCtaBanner("something-else")).toBe(false);
    });
  });

  it("inserts CTA banners in between content entries", async () => {
    const ctaBanners = [
      { name: "CTA Banner 1" },
      { name: "CTA Banner 2" },
      { name: "CTA Banner 3" },
    ];

    const wrapper = factory({ ctaBanners });

    const result = await wrapper.vm.fetchContent();

    // Should return an array with 6 elements: [8 entries, 'cta-banner-0', 8 entries, 'cta-banner-1', 8 entries, 'cta-banner-2']
    expect(result.length).toBe(6);
    expect(result[0].length).toBe(8);
    expect(result[1]).toBe("cta-banner-0");
  });
});
