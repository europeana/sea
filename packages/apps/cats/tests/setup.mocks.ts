import { vi } from "vitest";

vi.mock("bullmq", () => {
  return {
    FlowProducer: vi.fn(
      class {
        add = vi.fn();
      },
    ),
    Queue: vi.fn(
      class {
        add = vi.fn();
      },
    ),
  };
});
vi.mock("h3", () => {
  return {
    defineEventHandler: vi.fn().mockImplementation((callback) => callback),
    readBody: vi.fn(),
    setResponseStatus: vi.fn(),
  };
});
vi.mock("nitropack/runtime", () => {
  return {
    useRuntimeConfig: vi.fn().mockReturnValue({ redis: {} }),
  };
});
vi.mock("ioredis", () => {
  return {
    default: vi.fn(class {}),
  };
});
