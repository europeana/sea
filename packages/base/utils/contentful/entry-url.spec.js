import { describe, it, expect } from "vitest";
import { contentfulEntryUrl } from "@/utils/contentful/entry-url.js";

const blogEntry = {
  __typename: "BlogPosting",
  identifier: "blogIdentifier",
};
const exhibitionEntry = {
  __typename: "ExhibitionPage",
  identifier: "exhibitionIdentifier",
};
const storyEntry = {
  __typename: "Story",
  identifier: "storyIdentifier",
};

describe("@/utils/contentful/entry-url.js", () => {
  describe("contentfulEntryUrl", () => {
    it("returns /news/[identifer] for blog posts", () => {
      expect(contentfulEntryUrl(blogEntry)).toBe("/news/blogIdentifier");
    });
    it("returns /exhibitions/[identifer] for exhibition pages", () => {
      expect(contentfulEntryUrl(exhibitionEntry)).toBe(
        "/exhibitions/exhibitionIdentifier",
      );
    });
    it("returns /stories/[identifer] for stories", () => {
      expect(contentfulEntryUrl(storyEntry)).toBe("/stories/storyIdentifier");
    });
  });
});
