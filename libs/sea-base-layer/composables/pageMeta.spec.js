import { describe, it, expect, vi, afterEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { usePageMeta } from "./pageMeta";

const { useSeoMetaMock } = vi.hoisted(() => ({
  useSeoMetaMock: vi.fn(() => ({})),
}));
mockNuxtImport("useSeoMeta", () => useSeoMetaMock);

const fixtures = {
  title: "page title",
  description: "page seo description",
  image: {
    url: "https://images.ctfassets.net/image.jpg",
    description: "Preview image",
  },
};
const defaultExpectations = {
  title: fixtures.title,
  description: fixtures.description,
  ogTitle: fixtures.title,
  ogDescription: fixtures.description,
  ogImage: fixtures.image.url + "?w=1200&h=630&fit=fill&f=face&fm=webp&q=40",
  ogImageAlt: fixtures.image.description,
  ogType: undefined,
};
describe("usePageMeta", () => {
  afterEach(() => {
    useSeoMetaMock.mockReset();
  });

  describe("passing title, description and image", () => {
    it("uses useSeoMeta to set the html meta tags", () => {
      usePageMeta(fixtures);

      expect(useSeoMetaMock).toHaveBeenCalledWith(defaultExpectations);
    });
  });

  describe("when called without an image", () => {
    it("does not pass image data to the useSeoMeta call", () => {
      usePageMeta({ ...fixtures, image: false });

      expect(useSeoMetaMock).toHaveBeenCalledWith({
        ...defaultExpectations,
        ogImage: null,
        ogImageAlt: undefined,
      });
    });
  });

  describe("when called with an ogType", () => {
    it("uses useSeoMeta to set the 'article' ogType", () => {
      usePageMeta({ ...fixtures, ogType: "article" });

      expect(useSeoMetaMock).toHaveBeenCalledWith({
        ...defaultExpectations,
        ogType: "article",
      });
    });
  });
});
