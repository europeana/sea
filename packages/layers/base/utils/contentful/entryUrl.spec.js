import { describe, it, expect } from "vitest";
import { entryUrl } from "./entryUrl.js";

const blogEntry = {
  __typename: "BlogPosting",
  identifier: "blogIdentifier",
};

describe("@/utils/contentful/entry-url.js", () => {
  describe("entryUrl", () => {
    it("returns /news/[identifer] for blog posts", () => {
      expect(entryUrl(blogEntry)).toBe("/news/blogIdentifier");
    });
  });
});
