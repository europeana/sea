import { describe, it, expect } from "vitest";
import { deepFindEntriesOfType } from "./deepFindEntriesOfType.js";

describe("deepFindEntriesOfType", () => {
  it("returns a flattened array of matching content entries", () => {
    const contentType = "ImageCard";
    const items = [
      {
        __typename: contentType,
      },
      {
        __typename: contentType,
      },
      {
        __typename: "SubSection",
        hasPartCollection: {
          items: [
            {
              __typename: contentType,
            },
            {
              __typename: "RichText",
            },
          ],
        },
      },
      {
        __typename: contentType,
      },
    ];

    const matches = deepFindEntriesOfType(items, contentType);

    expect(matches.length).toBe(4);
  });
});
