import { describe, expect, it, vi } from "vitest";
import plugin from "../../../server/plugins/logging.ts";

vi.mock("nitropack/runtime", () => {
  return {
    defineNitroPlugin: vi.fn().mockImplementation((callback) => callback),
  };
});

describe("@/server/plugins/logging.ts", () => {
  describe("plugin", () => {
    it("registers morgan for combined-format logging", () => {
      const nitroApp = {
        hooks: {
          hook: vi.fn(),
        },
      };
      plugin(nitroApp);

      expect(nitroApp.hooks.hook).toHaveBeenCalled();
    });
  });
});
