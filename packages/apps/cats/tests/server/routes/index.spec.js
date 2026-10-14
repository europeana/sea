import { describe, it, expect, vi } from "vitest";
import route from "../../../server/routes/index.ts";

vi.mock("h3", () => {
  return {
    defineEventHandler: vi.fn().mockImplementation((callback) => callback),
  };
});

describe("@/server/routes/index.ts", () => {
  describe("route", () => {
    it("returns OK", () => {
      const response = route();

      expect(response).toBe("OK");
    });
  });
});
