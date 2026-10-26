import { vi } from "vitest";

vi.mock("bullmq", () => ({
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
}));

vi.mock("contentful-management", () => ({
  default: vi.fn(() => ({
    createClient: vi.fn(() => ({
      getSpace: vi.fn(() => ({
        getEnvironment: vi.fn(() => ({
          createEntry: vi.fn(),
          getEntries: vi.fn(),
        })),
      })),
    })),
  })),
}));

vi.mock("h3", () => ({
  defineEventHandler: vi.fn((callback) => callback),
  readBody: vi.fn(),
  setResponseStatus: vi.fn(),
}));

vi.mock("ioredis", () => ({
  default: vi.fn(class {}),
}));

vi.mock("nitropack/runtime", () => ({
  useRuntimeConfig: vi.fn().mockReturnValue({ redis: {} }),
}));

vi.mock("node-fetch-native", () => ({
  default: vi.fn(),
}));
