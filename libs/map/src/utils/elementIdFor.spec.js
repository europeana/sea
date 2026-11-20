import { describe, expect, it } from "vitest";

import { elementIdFor } from "./elementIdFor.js";

describe("@/utilas/elementIdFor.js", () => {
  describe("type keyboardEventTarget", () => {
    const type = "keyboardEventTarget";
    it("appends -keyboard-toggle to map element ID", () => {
      const mapElementId = "europeana-map";

      const elementId = elementIdFor(mapElementId, type);

      expect(elementId).toBe("europeana-map-keyboard-toggle");
    });
  });

  describe("type keyboardFocusPinToggle", () => {
    const type = "keyboardFocusPinToggle";
    it("appends -keyboard-focus-pin-toggle to map element ID", () => {
      const mapElementId = "europeana-map";

      const elementId = elementIdFor(mapElementId, type);

      expect(elementId).toBe("europeana-map-keyboard-focus-pin-toggle");
    });
  });
});
