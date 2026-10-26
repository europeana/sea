import { describe, it, expect } from "vitest";
import route from "../../../server/routes/index";

describe("@/server/routes/index", () => {
  describe("route", () => {
    it("returns OK", () => {
      const response = route();

      expect(response).toBe("OK");
    });
  });
});
