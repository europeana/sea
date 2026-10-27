import { describe, it, expect } from "vitest";
import route from "@/routes/index";

describe("@/routes/index", () => {
  describe("route", () => {
    it("returns OK", () => {
      const response = route();

      expect(response).toBe("OK");
    });
  });
});
