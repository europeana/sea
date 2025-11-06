import { describe, it, expect } from "vitest";
import { entryUrl } from "./entryUrl.js";

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
  describe("entryUrl", () => {
    it("returns /news/[identifer] for blog posts", () => {
      expect(entryUrl(blogEntry)).toBe("/news/blogIdentifier");
    });
    it("returns /exhibitions/[identifer] for exhibition pages", () => {
      expect(entryUrl(exhibitionEntry)).toBe(
        "/exhibitions/exhibitionIdentifier",
      );
    });
    it("returns /stories/[identifer] for stories", () => {
      expect(entryUrl(storyEntry)).toBe("/stories/storyIdentifier");
    });
  });
});
