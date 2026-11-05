import { describe, expect, it, vi } from "vitest";
import plugin from "@/plugins/logging";

vi.mock("nitropack/runtime", () => {
  return {
    defineNitroPlugin: vi.fn().mockImplementation((callback) => callback),
  };
});

const mocks = vi.hoisted(() => {
  return {
    morgan: vi.fn(),
    logger: vi.fn(),
  };
});

vi.mock("morgan", () => {
  return {
    default: mocks.morgan,
  };
});

mocks.morgan.mockImplementation(() => mocks.logger);

describe("@/plugins/logging", () => {
  describe("plugin", () => {
    it("registers beforeResponse hook for combined-format logging with morgan", () => {
      let hookName;
      let hookEventHandler;

      const nitroApp = {
        hooks: {
          hook: vi.fn().mockImplementation((name, eventHandler) => {
            hookName = name;
            hookEventHandler = eventHandler;
          }),
        },
      };
      const event = {
        node: { req: {}, res: {} },
      };
      plugin(nitroApp);
      hookEventHandler(event);

      expect(nitroApp.hooks.hook).toHaveBeenCalled();
      expect(hookName).toBe("beforeResponse");
      expect(mocks.morgan).toHaveBeenCalledWith("combined");
      expect(mocks.logger).toHaveBeenCalled();
    });
  });
});
