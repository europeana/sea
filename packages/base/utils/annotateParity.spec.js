import { describe, it, expect } from "vitest";
import { annotateParity } from "./annotateParity.js";

describe("annotateParity", () => {
  it("adds odd/even property to each item", () => {
    const items = [{}, {}, {}, {}];

    annotateParity(items);

    expect(items[0].parity).toBe("odd");
    expect(items[1].parity).toBe("even");
    expect(items[2].parity).toBe("odd");
    expect(items[3].parity).toBe("even");
  });
});
